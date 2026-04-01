import { forwardToBackend } from "../../helpers";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Servico/GetServicoById${params.id}`);
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json();
  return forwardToBackend(`Servico/PutServico${params.id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: Params) {
  return forwardToBackend(`Servico/DeleteServico${params.id}`, {
    method: "DELETE",
  });
}
