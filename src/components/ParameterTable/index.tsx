import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ItemRow } from '../Structure';

type ParameterTableProps = {
  items: Record<string, string>;
  noLabel?: boolean;
  errorLabel?: string;
  errorComponent?: React.ReactNode;
  'data-testid'?: string;
};

const ParameterTable: React.FC<ParameterTableProps> = ({ items, errorLabel, errorComponent, noLabel }) => {
  const { t } = useTranslation();

  return (
    <>
      <ItemRow pad="md" style={{ paddingLeft: '0.25rem', fontSize: '0.875rem' }}>
        {!noLabel && <div style={{ width: '7.5rem' }}>{t('run.parameters')}</div>}
        <div>
          {Object.keys(items).length === 0 ? (
            <ItemRow>{errorComponent ? errorComponent : errorLabel || t('error.not-found')}</ItemRow>
          ) : (
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
          )}
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
`;
const ParameterValue = styled.td`
  color: ${(p) => p.theme.color.text.dark};
  word-break: break-all;
  padding-bottom: 0.5rem;
`;

export default ParameterTable;
