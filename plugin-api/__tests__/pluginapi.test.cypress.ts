// We want to make sure every test starts from empty state, so
// remove cache data about plugin api from require.
function removeRequireCacheEntry() {
  delete require.cache[require.resolve('../MetaflowPluginAPI.js')];
}


/**
 * Most of the tests in this file follows same pattern. Metaflow Plugin API functions
 * calls postmessage of parent window, so we need to listen if parent actually gets messages.
 * Also part of functions has callbacks as arguments so we need to call postMessage of
 * current window to see if these subscribes works.
 * 
 * Also need to have cy.waitUntil in tests so we make sure all expects are listened.
 */
describe('PluginAPITests', () => {

  afterEach(() => {
    removeRequireCacheEntry();
  });

  it('Metaflow.onReady', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let onReadyCalled = false;

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginRegisterEvent');
    }
    window.parent.addEventListener('message', listener);

    // Set onReady callback
    Metaflow.onReady(() => (onReadyCalled = true));
    // Set ReadyToRender, this should trigger onready.
    window.postMessage({ name: window.name, type: 'ReadyToRender', config: '1', resource: '2' });

    cy.waitUntil(() => onReadyCalled).then(() => {
      expect(Metaflow.parameters).to.equal('1');
      expect(Metaflow.resource).to.equal('2');
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  // This should be same as onReady.
  it('Metaflow.register (deprecated)', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let onReadyCalled = false;
    Metaflow.register({}, () => (onReadyCalled = true));
    window.postMessage({ name: window.name, type: 'ReadyToRender', config: '1', resource: '2' });
    cy.waitUntil(() => onReadyCalled).then(() => {
      expect(Metaflow.parameters).to.equal('1');
      expect(Metaflow.resource).to.equal('2');
    });
  });

  it('Metaflow.setHeight', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    const heightlistener = cy.stub();
    let called = false;

    // Add event listener to parent window.
    const listener = (event) => {
      called = true;
      heightlistener(event.data.height);
    }
    window.parent.addEventListener('message', listener);

    Metaflow.setHeight();
    Metaflow.setHeight(100);

    cy.waitUntil(() => called).then(() => {
      // First call is expected to be 0 since script has now been attached to DOM
      expect(heightlistener).to.have.been.calledWith(0);
      // Second call should be 100 as requested
      expect(heightlistener).to.have.been.calledWith(100);
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  it('Metaflow.subscribe', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let paths;
    let callback = cy.stub();

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginSubscribeToData');
      paths = event.data.paths;
    }
    window.parent.addEventListener('message', listener);

    // Susbcribe to 'somepath' data
    Metaflow.subscribe(['somepath'], callback);

    const DataMessage = { name: window.name, type: 'DataUpdate', data: 'test' };
    window.postMessage(DataMessage);

    cy.waitUntil(() => paths && paths.length > 0).then(() => {
      // Parent should get paths in a message
      expect(paths[0]).to.equal('somepath');
      // Listeners should have been triggered due window.postMessage
      expect(callback).to.have.been.calledWith(DataMessage);
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  it('Metaflow.on', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let receivedEvent;
    const callback = cy.stub();

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginSubscribeToEvent');
      receivedEvent = event.data.events;
    }
    window.parent.addEventListener('message', listener);

    // Susbcribe to HELLO_WORLD event
    Metaflow.on('HELLO_WORLD', callback);
    
    // Call event 
    const EventMessage = { name: window.name, type: 'EventUpdate', data: { type: 'HELLO_WORLD', data: '123' } };
    window.postMessage(EventMessage);

    cy.waitUntil(() => !!receivedEvent).then(() => {
      expect(receivedEvent).to.equal('HELLO_WORLD');
      expect(callback).to.have.been.calledWith(EventMessage)
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  it('Metaflow.call', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let receivedEvent;

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginCallEvent');
      receivedEvent = event.data.data;
    }
    window.parent.addEventListener('message', listener);

    // call custom HELLO_WORLD event
    Metaflow.call('HELLO_WORLD', 12345);
  
    cy.waitUntil(() => !!receivedEvent).then(() => {
      expect(receivedEvent).to.equal(12345);
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  it('Metaflow.sendNotification', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let receivedEvent;

    // Add event listener to parent window.
    const listener = (event) => {
      receivedEvent = event.data;
    }
    window.parent.addEventListener('message', listener);

    // call custom HELLO_WORLD event
    Metaflow.sendNotification('HELLO_WORLD');
    
    cy.waitUntil(() => !!receivedEvent)
      .then(() => {
        expect(receivedEvent.type).to.equal('PluginCallEvent');
        expect(receivedEvent.event).to.equal('SEND_NOTIFICATION');
        expect(receivedEvent.data).to.equal('HELLO_WORLD');
        window.parent.removeEventListener('message', listener);
      })
  });

  it('Metaflow.subscribeToMetadata', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let paths;

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginSubscribeToData');
      paths = event.data.paths;
    }
    window.parent.addEventListener('message', listener);

    // Susbcribe to 'somepath' data
    Metaflow.subscribeToMetadata(cy.stub());

    cy.waitUntil(() => paths && paths.length > 0).then(() => {
      // Parent should get paths in a message
      expect(paths[0]).to.equal('metadata');
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });

  it('Metaflow.subscribeToRunMetadata', () => {
    const { Metaflow } = require('../MetaflowPluginAPI');
    let paths;

    // Add event listener to parent window.
    const listener = (event) => {
      expect(event.data.type).to.equal('PluginSubscribeToData');
      paths = event.data.paths;
    }
    window.parent.addEventListener('message', listener);

    // Susbcribe to 'somepath' data
    Metaflow.subscribeToRunMetadata(cy.stub());

    cy.waitUntil(() => paths && paths.length > 0).then(() => {
      // Parent should get paths in a message
      expect(paths[0]).to.equal('run-metadata');
      // Remove Event listener so we dont trigger it in upcoming tests
      window.parent.removeEventListener('message', listener);
    });
  });
});
