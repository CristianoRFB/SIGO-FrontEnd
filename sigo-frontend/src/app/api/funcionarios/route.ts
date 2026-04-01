import { forwardToBackend } from "../helpers";

export async function GET() {
  return forwardToBackend("Funcionario/GetFuncionario");
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardToBackend("Funcionario/PostCliente", {
    method: "POST",
    body,
  });
}
