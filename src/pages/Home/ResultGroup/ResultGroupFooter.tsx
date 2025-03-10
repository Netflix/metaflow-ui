import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@components/Button';
import Icon from '@components/Icon';

//
// Typedef
//

type ResultGroupFooterProps = {
  grouping: boolean;
  rows: number;
  onOpenGroup: () => void;
};

//
// Component
//

const ResultGroupFooter: React.FC<ResultGroupFooterProps> = ({ grouping, rows, onOpenGroup }) => {
  const { t } = useTranslation();
  if (!grouping || rows < 1) return null;

  return (
    <div style={{ position: 'relative' }}>
      <Button className="load-more" onClick={() => onOpenGroup()} size="sm" variant="primaryText" textOnly>
        {t('home.show-all-runs')} <Icon name="arrowDown" rotate={-90} padLeft />
      </Button>
    </div>
  );
};

export default ResultGroupFooter;
