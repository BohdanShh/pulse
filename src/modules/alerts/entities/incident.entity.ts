import { incidents } from '../../../database/schema/index.js';

type IncidentRow = typeof incidents.$inferSelect;

export class Incident implements IncidentRow {
  id: string;

  monitorId: string;

  /** When the monitor was marked DOWN. */
  startedAt: Date;

  /** When the monitor was UP again. Null while the incident is ongoing. */
  endedAt: Date | null;

  /** Error of the check that marked the monitor DOWN. */
  cause: string | null;
}
