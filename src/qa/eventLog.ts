// Member 4: tiny in-memory event log used as device test evidence.
// It records what happened (permission changes, captures, cancellations).
// It never stores photos, only short text lines.
export type LogEntry = {time: string; event: string; detail?: string};

let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

export function logEvent(event: string, detail?: string): void {
  const time = new Date().toTimeString().slice(0, 8); // HH:MM:SS
  entries = [...entries, {time, event, detail}];
  listeners.forEach(l => l());
}

export const getEntries = (): LogEntry[] => entries;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearLog(): void {
  entries = [];
  listeners.forEach(l => l());
}

export function formatLog(): string {
  const lines = entries.map(e => `${e.time}  ${e.event}${e.detail ? '  ' + e.detail : ''}`);
  return ['FieldCamera QA log', `Entries: ${entries.length}`, '', ...lines].join('\n');
}
