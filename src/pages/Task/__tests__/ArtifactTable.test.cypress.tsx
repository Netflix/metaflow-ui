import { mount } from '@cypress/react';
import React from 'react';
import ArtifactTable from '@pages/Task/components/ArtifactTable';
import { createArtifact } from '@utils/testhelper';
import TestWrapper, { gid } from '@utils/testing';

describe('ArtifactTable', () => {
  it('Should render warning about no artifacts', () => {
    mount(
      <TestWrapper>
        <ArtifactTable artifacts={[]} onOpenContentClick={cy.stub()} />
      </TestWrapper>,
    );

    gid('no-artifacts-warning');
  });

  it('Should render normal lines', () => {
    mount(
      <TestWrapper>
        <ArtifactTable
          artifacts={[
            createArtifact({ name: 'FirstArtifact', content: 'ImportantStuff' }),
            createArtifact({ name: 'SecondArtifact', content: 'blabla', ds_type: 'local' }),
          ]}
          onOpenContentClick={cy.stub()}
        />
      </TestWrapper>,
    );

    gid('property-table-row').eq(0).contains('ImportantStuff');
    gid('property-table-row').eq(0).contains('Remote');

    gid('property-table-row').eq(1).contains('blabla');
    gid('property-table-row').eq(1).contains('Local');
  });

  it('Should render error line and substring of content', () => {
    mount(
      <TestWrapper>
        <ArtifactTable
          artifacts={[
            createArtifact({
              name: 'FirstArtifact',
              content:
                'PUmiSojxKJMvBBDgkkX8VOKYQFWc5zGcLqgubleCcZewA9GdVRha0b3m1iVzifYFbmbNdsCd3AiASH2zaYpaucFEaxwRm4TClTEKZvaa404CsyPVoDX5wHapXaOuc4GA7P3LAJMVkceUx20EDMa4qKJyBgazdkHCYmshaaopc8LQMFvdeJVNfjMJp6i2z80FaCf3OeltfRZf0NNfWWTnW0PS5IhKRHRw6YvzsZ4BQ5MbWFAiJFlsamDdcacdQxpMrk3McxSHHPn2TXJL8DoGM8dpQcaKuc8QgafBP1GKfuV6CTrucfnfluDJAOWV7H38IidQHAxwPoaNFN4sBXPmLj7ucsRDBGBLdTOdVl3iK1IJrV2Iu9JxKsEY8rTkduvdhPPfGxOexCdOQoT5rQhJ4CHVlTCeuAO9FxyuUTnJ4J6WfnFtGbWVqtu9EJ14JvBY8qzPN9E7I2S7REqZ2G3ZX9S9nGiEoxEKfUwpEw2TdTYxOH797R4gM',
            }),
            createArtifact({ name: 'SecondArtifact', postprocess_error: { id: 'string', detail: 'string' } }),
          ]}
          onOpenContentClick={cy.stub()}
        />
      </TestWrapper>,
    );

    gid('property-table-row').eq(0).find('[data-testid=artifact-open-content]');
    gid('property-table-row').eq(1).find('[data-testid=artifact-post-error]');
  });

  it('Should open location modal correctly', () => {
    mount(
      <TestWrapper>
        <ArtifactTable
          artifacts={[
            createArtifact({ name: 'FirstArtifact', content: 'ImportantStuff' }),
            createArtifact({ name: 'SecondArtifact', content: 'blabla', ds_type: 'local' }),
          ]}
          onOpenContentClick={cy.stub()}
        />
      </TestWrapper>,
    );

    gid('select-field').eq(0).click();
    cy.get('button').contains('Python').click();
    gid('modal-container');
    gid('modal-content').contains("Task('LogTestFlow/968832/loglines/33632798', attempt=0)['FirstArtifact'].data");
  });
});
