export class ApiError extends Error {
  status: number;
  response: any;

  constructor(message: string, status: number, response: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }
}

interface SimpleFetchOptions extends RequestInit {
  parseJson?: boolean;
}

export async function apiFetch(
  url: string,
  options: SimpleFetchOptions = {}
): Promise<any> {
  const { headers, parseJson = true, ...rest } = options;


  let response: Response;

  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache: "no-store",
    });
    console.log(response);

  } catch (err) {
    console.error("💥 ERRO DE REDE:", err);
    throw new ApiError("Erro de rede", 0, err);
  }

  let data: any = null;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    console.warn("⚠️ Não foi possível parsear JSON, retornando texto cru.");
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(`Erro HTTP ${response.status}`, response.status, data);
  }

  return parseJson ? data : undefined;
}