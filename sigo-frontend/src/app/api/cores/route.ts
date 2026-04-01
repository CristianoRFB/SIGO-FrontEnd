import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Cor");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Cor", {
    method: "POST",
    body,
  });
}
