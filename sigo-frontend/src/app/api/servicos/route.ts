import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Servico/GetServico");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Servico/PostService", {
    method: "POST",
    body,
  });
}
