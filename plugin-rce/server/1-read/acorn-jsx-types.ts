import * as Acorn from "acorn";

export interface JSXIdentifier extends Acorn.Node {
  type: 'JSXIdentifier';
  name: string;
}

export interface JSXAttribute extends Acorn.Node {
  type: 'JSXAttribute';
  name: JSXIdentifier;
  value: JSXExpressionContainer | Acorn.Literal | Acorn.ObjectExpression;
  // value: name={var} | name="string" | name={{...obj}}
}

export interface JSXSpreadAttribute extends Acorn.Node {
  type: 'JSXSpreadAttribute'
  argument: Acorn.Identifier
}

export interface JSXOpeningElement extends Acorn.Node {
  type: 'JSXOpeningElement';
  name: JSXIdentifier;
  attributes: (JSXAttribute | JSXSpreadAttribute)[];
  selfClosing: boolean;
}

export interface JSXClosingElement extends Acorn.Node {
  type: 'JSXClosingElement';
  name: JSXIdentifier;
}

export interface JSXOpeningFragment extends Acorn.Node {
  type: 'JSXOpeningFragment';
  name: JSXIdentifier;
  attributes: (JSXAttribute | JSXSpreadAttribute)[];
  selfClosing: boolean;
}

export interface JSXClosingFragment extends Acorn.Node {
  type: 'JSXClosingFragment';
  name: JSXIdentifier;
}

export interface JSXExpressionContainer extends Acorn.Node {
  type: 'JSXExpressionContainer';
  expression: Acorn.Literal
  | Acorn.Identifier
  | Acorn.LogicalExpression
  | Acorn.ConditionalExpression
  | Acorn.CallExpression
  | Acorn.MemberExpression
}

export interface JSXText extends Acorn.Node {
  type: 'JSXText';
  value: string;
  raw: string;
}

export interface JSXFragment extends Acorn.Node {
  type: 'JSXFragment';
  openingFragment: JSXOpeningFragment;
  closingFragment?: JSXClosingFragment;
  children: (JSXElement | JSXText)[]
}

export interface JSXElement extends Acorn.Node {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  closingElement?: JSXClosingElement;
  children: (JSXElement | JSXText | JSXExpressionContainer)[];
  path: string;
}

export type JSXEspression =
  | JSXIdentifier
  | JSXAttribute
  | JSXSpreadAttribute
  | JSXOpeningElement
  | JSXClosingElement
  | JSXOpeningFragment
  | JSXClosingFragment
  | JSXExpressionContainer
  | JSXText
  | JSXFragment
  | JSXElement

export type JSXNodes =
  | JSXIdentifier
  | JSXAttribute
  | JSXSpreadAttribute
  | JSXOpeningElement
  | JSXClosingElement
  | JSXOpeningFragment
  | JSXClosingFragment
  | JSXExpressionContainer
  | JSXText
  | JSXFragment
  | JSXElement