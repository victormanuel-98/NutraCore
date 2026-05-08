export const PROFILE_SYNC_EVENT = 'nutracore:profile-sync';

export function emitProfileSync(detail = {}) {
  window.dispatchEvent(new CustomEvent(PROFILE_SYNC_EVENT, { detail }));
}

export function subscribeToProfileSync(callback) {
  const handler = (event) => callback?.(event);
  window.addEventListener(PROFILE_SYNC_EVENT, handler);
  return () => window.removeEventListener(PROFILE_SYNC_EVENT, handler);
}
