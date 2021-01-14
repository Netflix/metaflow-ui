import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import GenericError from '../GenericError';
import { ItemRow } from '../Structure';

type ParameterTableProps = {
  items: Record<string, string>;
  label: string;
  errorLabel?: string;
  errorComponent?: React.ReactNode;
  'data-testid'?: string;
};

const ParameterTable: React.FC<ParameterTableProps> = ({ items, label, errorLabel, errorComponent }) => {
  const { t } = useTranslation();

  return (
    <>
      {Object.keys(items).length === 0 && (
        <ItemRow margin="md">
          {errorComponent ? errorComponent : <GenericError noIcon message={errorLabel || t('error.not-found')} />}
        </ItemRow>
      )}

      <ItemRow pad="md" style={{ paddingLeft: '0.25rem' }}>
        <div style={{ width: '120px', fontSize: '0.875rem' }}>Parameters</div>
        <div>
          <table>
            <tbody>
              {Object.keys(items).map((key) => (
                <tr key={key}>
                  <ParameterKey>{key}</ParameterKey>
                  <ParameterValue>{readParameterValue(items[key])}</ParameterValue>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ItemRow>
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
  font-size: 0.875rem;
`;
const ParameterValue = styled.td`
  color: ${(p) => p.theme.color.text.dark};
  word-break: break-all;
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
`;

export default ParameterTable;
