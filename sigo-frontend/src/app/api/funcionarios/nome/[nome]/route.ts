import { forwardToBackend } from "../../../helpers";

type Params = {
  params: { nome: string };
};

export async function GET(_: Request, { params }: Params) {
  return forwardToBackend(`Funcionario/GetFuncionarioByNome/${params.nome}`);
}
