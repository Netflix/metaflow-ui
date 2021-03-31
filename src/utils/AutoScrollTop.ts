import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { getRouteMatch } from './routing';

export default function AutoScrollTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = getRouteMatch(pathname);
    // Don't use up feature when on task page, there is some scroll handling
    if (match && match.params.taskId) {
      return;
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
