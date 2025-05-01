import { createConfig } from '/rce/client';
let __my_component = createConfig('my-component');
let __custom_div = createConfig('custom-div');
let __custom_span = createConfig('custom-span');
const stateSymbol = Symbol("state");
import { $state } from "rce";
const $hook = (_c) => 
function $hook() {
  let bool = _c.set($state(false),['bool']);
  return [bool];
}
function Partial() {
}
function Component({ title = "hello rce" }) {
__my_component.props(title);

  let counter = __my_component.set($state(0),['counter']);
  let { a: A, b, c: ALIAS } = __my_component.set($state({ a: 0, b: 1, c: 2 }),['A','b','ALIAS']);
  let [AAA, BBB] = __my_component.set($state(["a", "b"]),['AAA','BBB']);
  let array = __my_component.set($state([0, 1, 2, 3]),['array']);
  let [bool] = $hook(__my_component)();
  function add() {
    console.log("im alive");
    console.log(counter);
    counter += 1;
  __my_component.batch({ counter });}
  function update() {
    console.log(A, b, ALIAS);
  __my_component.batch({ A,b,ALIAS });}
  const props = {};
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("span", { ...props }, counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), h("div", null, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", null, "if")), {render: counter > 1}));
}
const StatelessComponent = (props) => /* @__PURE__ */ (__custom_div.props(props),h("custom-div", null, h("span", null, "hello", {render: props.hello})));
const Comp = function(props) {
__custom_span.props(props);

  return /* @__PURE__ */ h("custom-span", null, props.hello);
};
Component({});
StatelessComponent({});
Comp({});
