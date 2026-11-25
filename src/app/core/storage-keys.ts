/** localStorage keys used to keep the session between visits. */
export const STORAGE_KEYS = {
  accessToken: 'polymind_access_token',
  refreshToken: 'polymind_refresh_token',
  userName: 'polymind_user_name'
} as const;

/** Remove every session value from the browser. */
export function clearSessionStorage(): void {
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
}
