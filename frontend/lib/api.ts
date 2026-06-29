const apiConfigurada = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const API_ORIGIN = apiConfigurada
  ? apiConfigurada.replace(/\/api$/i, "")
  : "";
export const API_URL = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

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

  const contenido = await response.text();
  let data: Record<string, unknown> | null = null;

  if (contenido) {
    try {
      data = JSON.parse(contenido) as Record<string, unknown>;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errores = Array.isArray(data?.errores) ? data.errores : [];
    const detalle = typeof errores[0] === "string" ? errores[0] : null;
    const mensaje = typeof data?.mensaje === "string" ? data.mensaje : null;
    throw new ApiError(
      detalle ?? mensaje ?? response.statusText ?? "Error en la solicitud",
      response.status
    );
  }

  return data as T;
}

export function resolverUrlArchivo(url?: string | null) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return API_ORIGIN ? `${API_ORIGIN}${url}` : url;

  return API_ORIGIN ? `${API_ORIGIN}/${url}` : `/${url}`;
}
