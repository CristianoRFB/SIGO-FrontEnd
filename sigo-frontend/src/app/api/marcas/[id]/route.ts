import { forwardToBackend } from "../../helpers";

type Params = {
  params: { id: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Marca/${params.id}`);
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json();
  return forwardToBackend(`Marca/${params.id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: Params) {
  return forwardToBackend(`Marca/${params.id}`, {
    method: "DELETE",
  });
}
