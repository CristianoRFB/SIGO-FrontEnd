export const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:7241/api/";

export function buildBackendUrl(path: string) {
  const cleanedPath = path.replace(/^\/+/, "");

  return `${BACKEND_API_BASE_URL}/${cleanedPath}`;
}