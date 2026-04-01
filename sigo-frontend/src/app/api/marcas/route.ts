import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Marca");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Marca", {
    method: "POST",
    body,
  });
}
