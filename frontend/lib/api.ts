export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detalle = Array.isArray(data?.errores) ? data.errores[0] : null;
    throw new ApiError(detalle ?? data?.mensaje ?? "Error en la solicitud", response.status);
  }

  return data as T;
}

export function resolverUrlArchivo(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;

  return `${API_ORIGIN}/${url}`;
}
