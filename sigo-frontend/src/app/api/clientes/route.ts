import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Cliente/GetCliente");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Cliente/PostCliente", {
    method: "POST",
    body,
  });
}
