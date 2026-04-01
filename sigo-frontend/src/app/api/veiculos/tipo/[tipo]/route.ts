import { forwardToBackend } from "../../../helpers";

type Params = {
  params: { tipo: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Veiculo/tipo/${params.tipo}`);
}
