import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import PropertyTable, { PropertyTableColumns } from '../../../components/PropertyTable';
import InformationRow from '../../../components/InformationRow';
import { Artifact } from '../../../types';
import { ForceBreakText } from '../../../components/Text';
import { ItemRow } from '../../../components/Structure';
import Icon from '../../../components/Icon';
import GenericError from '../../../components/GenericError';

type Props = { artifacts: Artifact[]; onOpenContentClick: (artifactName: string, data: string) => void };

const ArtifactTable: React.FC<Props> = ({ artifacts, onOpenContentClick }) => {
  const { t } = useTranslation();

  const columns: PropertyTableColumns<Artifact>[] = [
    { label: t('fields.artifact-name'), prop: 'name', width: '1%' },
    {
      label: t('fields.content'),
      accessor: (item) => {
        const data = item.content;

        if (data && data.length > 500) {
          return (
            <span>
              {data.slice(0, 500)}{' '}
              <OpenContenButton onClick={() => onOpenContentClick(item.name, data)}>Open content</OpenContenButton>
            </span>
          );
        }

        if (item.postprocess_error) {
          return (
            <ItemRow justify="flex-start">
              <Icon name="warningThick" customSize="auto" />
              <span>{t(getErrorString(item.postprocess_error.id))}</span>
            </ItemRow>
          );
        }

        return item.content;
      },
      width: '25%',
    },
    {
      label: t('fields.location'),
      accessor: (item) => <ForceBreakText>{item.location}</ForceBreakText>,
      width: '25%',
    },
    { label: t('fields.datastore-type'), prop: 'ds_type', width: '1%' },
  ];

  return (
    <>
      {artifacts && artifacts.length > 0 && (
        <InformationRow spaceless>
          <PropertyTable columns={columns} items={artifacts || []} scheme="dark" />
        </InformationRow>
      )}
      {artifacts && artifacts.length === 0 && (
        <ItemRow margin="lg">
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
  'object-too-large',
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
// Style
//

const OpenContenButton = styled.div`
  text-decoration: underline;
  cursor: pointer;
`;

export default ArtifactTable;
