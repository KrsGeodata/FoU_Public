// Hook that extracts the summary state passed via React Router's location state.
// Returns the SummaryState object (rejection info, early termination flag)
// or null if the user navigated to the summary page directly.
import { useLocation } from 'react-router-dom';
import type { SummaryState } from './SummaryTypes';

export function useSummary(): SummaryState | null {
  const location = useLocation();
  return location.state as SummaryState | null;
}
