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
  function add() {
    __my_component.$.counter = counter += 1;
  }
  const minus = () => __my_component.$.counter = counter -= 1;
  const props = {};
  return /* @__PURE__ */ __my_component.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", null, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), h('$if',counter > 1 , /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", null, "if")))));
}
const StatelessComponent = (props) => /* @__PURE__ */ (__custom_div.props(props), __custom_div.render = (h) =>h("custom-div", null, h('$if',props.hello , /* @__PURE__ */ h("span", null, "hello"))));
const Comp = function(props) {
__custom_span.props(props);

  return /* @__PURE__ */ __custom_span.render = (h) =>h("custom-span", null, props.hello);
};
__my_component.register(Component);
__custom_div.register(StatelessComponent);
__custom_span.register(Comp);
