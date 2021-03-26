import { render, waitFor } from '@testing-library/react';
import React from 'react';
import useAutoComplete, { AutoCompleteParameters } from '../';

const WORDS = ["ufo", "tarjosi", "kaakaon", "maistoin", "sanoin", "hyvää", "on"]
const OBJECTS = [{ key: "ufo" }, { key: "tarjosi" }, { key: "kaakaon" }]

const DefaultComponent = (args: Partial<AutoCompleteParameters<any>>) => {
  const hook = useAutoComplete({ url: '/words', input: '', ...args })

  return <div>
    <div data-testid="status">{hook.status}</div>
    <div data-testid="content">{hook.data.map(item => item.label).join(',')}</div>
    </div>
}

beforeEach(() => {
  global.fetch = jest.fn((url: string) =>{
    return Promise.resolve({
      status: 200,
      json: () => {
        if (url === "http://localhost/api/objects?_limit=5") {
          return Promise.resolve({ data: OBJECTS, status: 200 })
        } else if (url === "http://localhost/api/words?_limit=5") {
          return Promise.resolve({ data: WORDS, status: 200 })
        } else if (url.startsWith("http://localhost/api/words-limit")) {
          return Promise.resolve({ data: WORDS.filter(w => w.includes(url.split('q=')[1])), status: 200 })
        }
      },
    })
  }) as any;
});

test('useAutoComplete - preFetch, default filter', async () => {
  // Default finder is using String.includes to match input to results
  const { getByTestId, rerender } = render(<DefaultComponent preFetch input="a" />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('Ok'))
  await waitFor(() => expect(getByTestId('content').textContent).toBe('tarjosi,kaakaon,maistoin,sanoin'))
  // case-insensitive
  rerender(<DefaultComponent preFetch input="KaAkaO" />);
  expect(getByTestId('content').textContent).toBe('kaakaon')
  rerender(<DefaultComponent preFetch input="no-match-right?" />);
  expect(getByTestId('content').textContent).toBe('')
});

test('useAutoComplete - preFetch, custom filter', async () => {
  // Override default finder function
  const { getByTestId, rerender } = render(<DefaultComponent preFetch input="a" finder={(item) => item.value.includes('o')} />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('Ok'))
  await waitFor(() => expect(getByTestId('content').textContent).toBe('ufo,tarjosi,kaakaon,maistoin,sanoin,on'))
  // Changing input should not matter since our custom finder does not use it
  rerender(<DefaultComponent preFetch input="kaakao" finder={(item) => item.value.includes('o')} />);
  expect(getByTestId('content').textContent).toBe('ufo,tarjosi,kaakaon,maistoin,sanoin,on')
});

test('useAutoComplete - preFetch, custom payload', async () => {
  // Override default result parsing function
  const { getByTestId } = render(<DefaultComponent url="objects" preFetch input="a" parser={(item) => ({ value: item.key, label: item.key })} />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('Ok'))
  await waitFor(() => expect(getByTestId('content').textContent).toBe('tarjosi,kaakaon'))
});

test('useAutoComplete - no preFetch', async () => {
  // Don't use prefetch, backend should filter in this case
  const { getByTestId, rerender } = render(<DefaultComponent url="words-limit" input="a" params={{ q: 'a' }} />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('Ok'))
  await waitFor(() => expect(getByTestId('content').textContent).toBe('tarjosi,kaakaon,maistoin,sanoin'))
  rerender(<DefaultComponent url="words-limit" input="aa" params={{ q: 'aa' }} />);
  await waitFor(() => expect(getByTestId('content').textContent).toBe('kaakaon'))
});

test('useAutoComplete - no preFetch, allow empty search', async () => {
// Request should not be sent if input is empty
const { getByTestId, rerender } = render(<DefaultComponent url="words-limit" input="" params={{ q: '' }} />);
await waitFor(() => expect(getByTestId('status').textContent).toBe('NotAsked'))
// Adding searchEmpty param allows request without input
rerender(<DefaultComponent url="words-limit" input="" params={{ q: '' }} searchEmpty />);
await waitFor(() => expect(getByTestId('status').textContent).toBe('Ok'))
await waitFor(() => expect(getByTestId('content').textContent).toBe('ufo,tarjosi,kaakaon,maistoin,sanoin,hyvää,on'))
});

test('useAutoComplete - disabled', async () => {
  // Is disabled, never requested
  const { getByTestId, rerender } = render(<DefaultComponent url="words-limit" input="" params={{ q: '' }} enabled={false} searchEmpty />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('NotAsked'))
  // Adding searchEmpty param allows request without input
  rerender(<DefaultComponent url="words-limit" input="kaa" params={{ q: 'kaa' }} enabled={false} searchEmpty />);
  await waitFor(() => expect(getByTestId('status').textContent).toBe('NotAsked'))
});