import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import GenericError from '../GenericError';
import PropertyTable from '../PropertyTable';
import { ItemRow } from '../Structure';

type ParameterTableProps = {
  items: Record<string, string>;
  label: string;
  errorLabel?: string;
  errorComponent?: React.ReactNode;
};

const ParameterTable: React.FC<ParameterTableProps> = ({ items, label, errorLabel, errorComponent }) => {
  const { t } = useTranslation();

  const cols = [
    {
      label: label,
      accessor: (params: Record<string, string>) => (
        <table>
          <tbody>
            {Object.keys(params).map((key) => (
              <tr key={key}>
                <ParameterKey>{key}</ParameterKey>
                <ParameterValue>{readParameterValue(params[key])}</ParameterValue>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ];

  return (
    <>
      {Object.keys(items).length === 0 && (
        <ItemRow margin="md">
          {errorComponent ? errorComponent : <GenericError noIcon message={errorLabel || t('error.not-found')} />}
        </ItemRow>
      )}

      {Object.keys(items).length > 0 && <PropertyTable scheme="bright" items={[items]} columns={cols} />}
    </>
  );
};

function readParameterValue(str: string) {
  let val;
  try {
    val = JSON.parse(str);
  } catch (e) {
    return str;
  }

  if (!val) {
    return str;
  }

  if (typeof val === 'object') {
    return JSON.stringify(val, null, 2);
  }
  return str;
}

const ParameterKey = styled.td`
  padding-right: ${(p) => p.theme.spacer.hg}rem;
  color: ${(p) => p.theme.color.text.mid};
  padding-bottom: 0.5rem;
`;
const ParameterValue = styled.td`
  color: ${(p) => p.theme.color.text.dark};
  word-break: break-all;
  padding-bottom: 0.5rem;
`;

export default ParameterTable;
