import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Veiculo");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Veiculo", {
    method: "POST",
    body,
  });
}
