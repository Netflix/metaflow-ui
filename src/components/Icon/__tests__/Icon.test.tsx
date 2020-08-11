import React from 'react';
import Icon from '..';
import { render } from '@testing-library/react';

describe('Icon component', () => {
  test('<Icon /> - health check', () => {
    render(<Icon name="timeline" />);
  });
});
