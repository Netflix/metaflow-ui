import { useLocation } from 'react-router-dom';

export default function useQuery(): URLSearchParams {
  return new URLSearchParams(useLocation().search);
}
