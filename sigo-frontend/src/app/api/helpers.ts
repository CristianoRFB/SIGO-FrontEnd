import { Agent as UndiciAgent, type Dispatcher } from "undici";
import { NextResponse } from "next/server";
import { BACKEND_API_BASE_URL, buildBackendUrl } from "@/lib/config";

const insecureDevDispatcher: Dispatcher = new UndiciAgent({
  connect: {
    rejectUnauthorized: false,
    family: 4,
  },
});

type ForwardOptions = Omit<RequestInit, "body"> & { body?: unknown };

function toPascalCaseKey(key: string) {
  if (!key) {
    return key;
  }
  return key[0].toUpperCase() + key.slice(1);
}

function normalizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, child]) => {
      const normalizedKey = /^[a-z]/.test(key) ? toPascalCaseKey(key) : key;
      return [normalizedKey, normalizeKeys(child)];
    });
    return Object.fromEntries(entries);
  }

  return value;
}

export async function forwardToBackend(
  path: string,
  options: ForwardOptions = {}
) {
  const { body, headers, ...rest } = options;

  type NodeFetchInit = RequestInit & { dispatcher?: Dispatcher };

  const computedHeaders = new Headers(headers);
  computedHeaders.set("Accept", "application/json");

  const hasBody = body !== undefined;
  if (hasBody && !computedHeaders.has("Content-Type")) {
    computedHeaders.set("Content-Type", "application/json");
  }

  const init: NodeFetchInit = {
    ...rest,
    headers: computedHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: "no-store",
  };

  const shouldRelaxTls = (() => {
    if (process.env.NODE_ENV === "production") {
      return false;
    }

    try {
      const parsed = new URL(
        BACKEND_API_BASE_URL.startsWith("http")
          ? BACKEND_API_BASE_URL
          : `https://${BACKEND_API_BASE_URL}`
      );
      return (
        parsed.protocol === "https:" &&
        ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)
      );
    } catch {
      return BACKEND_API_BASE_URL.includes("localhost") ||
        BACKEND_API_BASE_URL.includes("127.0.0.1") ||
        BACKEND_API_BASE_URL.includes("::1");
    }
  })();

  if (shouldRelaxTls) {
    init.dispatcher = insecureDevDispatcher;
  }

  try {
    const backendUrl = buildBackendUrl(path);
    const response = await fetch(backendUrl, init);
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Backend returned non-JSON response", {
        url: backendUrl,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        preview: text.slice(0, 400),
      });
      return NextResponse.json(
        {
          message:
            text || `Resposta inesperada do backend (status ${response.status})`,
          backendStatus: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const normalized = normalizeKeys(data);
    return NextResponse.json(normalized, { status: response.status });
  } catch (error) {
    console.error("Erro ao comunicar com o backend:", {
      path,
      url: buildBackendUrl(path),
      error,
    });
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Erro desconhecido ao contatar backend",
      },
      { status: 500 }
    );
  }
}

export async function forwardWithBody(
  request: Request,
  pathBuilder: (body: unknown) => string,
  init?: Omit<ForwardOptions, "body">
) {
  const body = await request.json();
  const path = pathBuilder(body);
  return forwardToBackend(path, { ...init, body });
}
