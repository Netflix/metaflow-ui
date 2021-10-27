import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import PropertyTable, { PropertyTableColumns } from '../../../components/PropertyTable';
import InformationRow from '../../../components/InformationRow';
import { Artifact } from '../../../types';
import { ItemRow } from '../../../components/Structure';
import Icon from '../../../components/Icon';
import GenericError from '../../../components/GenericError';
import { valueToRenderableType } from '../../../components/TitledRow';
import Dropdown from '../../../components/Form/Dropdown';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import copy from 'copy-to-clipboard';

type Props = { artifacts: Artifact[]; onOpenContentClick: (artifactName: string, data: string) => void };
type PopupLink = { artifact: Artifact; variant: ValidLinkVariant };

const ArtifactTable: React.FC<Props> = ({ artifacts, onOpenContentClick }) => {
  const { t } = useTranslation();
  const [highlightLink, setHighlightLink] = useState<PopupLink | null>(null);

  const columns: PropertyTableColumns<Artifact>[] = [
    { label: t('fields.artifact-name'), prop: 'name', width: '1%' },
    {
      label: t('fields.content'),
      accessor: (item) => {
        const data = item.content;

        if (data && data.length > 500) {
          return (
            <span>
              {valueToRenderableType(data.slice(0, 500))}{' '}
              <OpenContenButton onClick={() => onOpenContentClick(item.name, data)} data-testid="artifact-open-content">
                Open content
              </OpenContenButton>
            </span>
          );
        }

        if (item.postprocess_error) {
          return (
            <ItemRow justify="flex-start" data-testid="artifact-post-error">
              <Icon name="warningThick" customSize="auto" />
              <span>{t(getErrorString(item.postprocess_error.id))}</span>
            </ItemRow>
          );
        }

        return item.content;
      },
      width: '18rem',
    },
    {
      label: t('fields.location'),
      accessor: (item) => (
        <LocationRenderer
          item={item}
          onSelect={(artifact: Artifact, variant) => setHighlightLink({ artifact, variant })}
        />
      ),
      width: '1%',
    },
  ];

  return (
    <>
      {artifacts && artifacts.length > 0 && (
        <InformationRow spaceless>
          <PropertyTable columns={columns} items={artifacts || []} scheme="dark" />
          <LinkPopup link={highlightLink} onClose={() => setHighlightLink(null)} />
        </InformationRow>
      )}
      {artifacts && artifacts.length === 0 && (
        <ItemRow margin="lg" data-testid="no-artifacts-warning">
          <GenericError message={t('task.no-artifacts-found')} />
        </ItemRow>
      )}
    </>
  );
};

//
// Utils
//
const knownErrorIds = [
  's3-access-denied',
  's3-not-found',
  's3-bad-url',
  's3-missing-credentials',
  's3-generic-error',
  'artifact-too-large',
  'artifact-not-accessible',
  'artifact-handle-failed',
];

function getErrorString(str: string): string {
  if (knownErrorIds.indexOf(str) > -1) {
    return `error.${str}`;
  }
  return 'error.artifact-unknown-error';
}

//
// Location Renderer
//

type ValidLinkVariant = 'python' | 'r';

type LocationRendererProps = {
  item: Artifact;
  onSelect: (artifact: Artifact, variant: ValidLinkVariant) => void;
};

const LocationRenderer: React.FC<LocationRendererProps> = ({ item, onSelect }) => {
  const { t } = useTranslation();
  return (
    <LocationRendererContainer>
      <LocationRenderTitle>
        {item.ds_type === 'local' ? t('task.artifact-local') : t('task.artifact-remote')}
      </LocationRenderTitle>
      <div>
        <Dropdown
          size="sm"
          labelRenderer={() => <Icon name="copy" />}
          onChange={(event) => {
            if (event) {
              onSelect(item, event.target.value as ValidLinkVariant);
            }
          }}
          options={[
            ['python', 'Python'],
            ['r', 'R'],
          ]}
          optionsAlignment="right"
        />
      </div>
    </LocationRendererContainer>
  );
};

const LocationRendererContainer = styled.div`
  display: flex;
  align-items: center;
  word-break: keep-all;

  div {
    text-transform: capitalize;
  }
`;

const LocationRenderTitle = styled.div`
  margin-right: 0.5rem;
`;

//
// Highlight link renderer
//

const LinkPopup: React.FC<{ link: PopupLink | null; onClose: () => void }> = ({ link, onClose }) => (
  <Modal
    show={!!link}
    onClose={onClose}
    title={`${link?.artifact.name} - ${link?.variant}`}
    actionbar={
      <Button
        iconOnly
        onClick={() => {
          if (link) {
            copy(makeArtifactCode(link));
          }
          onClose();
        }}
      >
        <Icon name="copy" />
      </Button>
    }
  >
    <CodeBlock>{link && makeArtifactCode(link)}</CodeBlock>
  </Modal>
);

// Keeping code snippet in object for now since we might to add separate snippets for different situations.
const codeByType = {
  any: {
    python: (artifact: Artifact) =>
      `Task('${artifact.flow_id}/${artifact.run_number}/${artifact.step_name}/${artifact.task_id}')['${artifact.name}'].data`,
    r: (artifact: Artifact) =>
      `flow$new("${artifact.flow_id}")$run("${artifact.run_number}")$step("${artifact.step_name}")$task("${artifact.task_id}")$artifact("${artifact.name}")$${artifact.name}`,
  },
};

function makeArtifactCode(link: PopupLink): string {
  return codeByType['any'][link.variant](link.artifact);
}

//
// Style
//

const OpenContenButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

const CodeBlock = styled(InformationRow)`
  font-family: 'RobotoMono';
  font-size: 0.875rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

export default ArtifactTable;
