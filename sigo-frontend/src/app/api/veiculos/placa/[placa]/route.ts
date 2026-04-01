import { forwardToBackend } from "../../../helpers";

type Params = {
  params: { placa: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Veiculo/placa/${params.placa}`);
}
