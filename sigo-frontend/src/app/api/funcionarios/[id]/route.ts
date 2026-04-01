import { forwardToBackend } from "../../helpers";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Funcionario/FetFuncionarioById${params.id}`);
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json();
  return forwardToBackend(`Funcionario/PutCliente${params.id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: Params) {
  return forwardToBackend(`Funcionario/DeleteFuncionario${params.id}`, {
    method: "DELETE",
  });
}
