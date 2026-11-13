import { useContext } from 'react';
import { OrganizerContext } from '../context/organizerContextDef';

export function useOrganizer() {
  const context = useContext(OrganizerContext);
  if (!context) {
    throw new Error('useOrganizer must be used within an OrganizerProvider');
  }
  return context;
}
