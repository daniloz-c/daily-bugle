/** API client for the Daily Bugle Express backend. */

export async function fetchTodayEdition() {
  const response = await fetch('/api/edition/today');
  if (!response.ok) {
    throw new Error(`Could not load today's edition (${response.status}).`);
  }
  const result = await response.json();
  return result.data;
}

export async function fetchEditionByDate(dateStr) {
  const response = await fetch(`/api/edition/${dateStr}`);
  if (!response.ok) {
    throw new Error(`No edition found for ${dateStr}.`);
  }
  const result = await response.json();
  return result.data;
}

export async function forceRefreshEdition() {
  const response = await fetch('/api/edition/force-refresh', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Could not refresh the edition.');
  }
  const result = await response.json();
  return result.data;
}

export async function fetchArchiveEditions() {
  const response = await fetch('/api/edition/archive');
  if (!response.ok) return [];
  const result = await response.json();
  return result.data || [];
}
