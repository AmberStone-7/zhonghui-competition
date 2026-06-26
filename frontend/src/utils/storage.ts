function getItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // silent — storage unavailable (e.g. private browsing)
  }
}

function removeItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // silent
  }
}

export const storage = { getItem, setItem, removeItem };
