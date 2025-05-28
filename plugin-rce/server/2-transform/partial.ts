import { HYDRATE } from "../../constant";
import { acorn, ReactiveNode } from "../ast";
import Transformer from "../Transformer";
import transform_body from "./body";


function transform_partial($node: ReactiveNode, node: acorn.Function, jsx: acorn.CallExpression) {


  if (node.params.length > 1) {
    throw "params error"
  }

  const params_start = Transformer.index_from(node.start, '(') + 1;

  Transformer.insert(params_start, `${HYDRATE},`)

  transform_body($node);

  // Transformer.insert(jsx.start, `(${HYDRATE}) => `)

}






export default transform_partial;