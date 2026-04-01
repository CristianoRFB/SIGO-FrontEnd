export function unwrapData<T>(payload: unknown): T | null {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: T | null }).data ?? null;
  }

  return (payload as T) ?? null;
}

export function unwrapArray<T>(payload: unknown): T[] {
  const data = unwrapData<T[] | T>(payload);

  if (!data) {
    return [];
  }

  return Array.isArray(data) ? data : [data];
}
