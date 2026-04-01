import { Agent } from "undici";
import { buildServerBackendUrl } from "@/lib/config";

const insecureLocalAgent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

async function proxyRequest(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(buildServerBackendUrl(path.join("/")));
  targetUrl.search = incomingUrl.search;

  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete("host");
  forwardedHeaders.delete("content-length");

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method,
    headers: forwardedHeaders,
    body,
    cache: "no-store",
    dispatcher:
      targetUrl.protocol === "https:" && targetUrl.hostname === "localhost"
        ? insecureLocalAgent
        : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}
