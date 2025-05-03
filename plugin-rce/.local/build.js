import { createConfig } from '/rce/client';
let __my_component = createConfig('my-component');
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
  let array = __my_component.set($state([1, 2, 3]),['array']);
  function add() {
    array.push(array.length + 1);
    console.log(array);
    counter += 1;
  }
  const minus = () => {
    counter -= 1;
    array.pop();
  };
  function test(i) {
    console.log(`u click the number ${i}`);
  }
  const props = {};
  __my_component.methods = new Set([add,minus]);
__my_component.batch = () => ({counter,array});
return /* @__PURE__ */ __my_component.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", null, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), 
h('$ternary',counter > 0,()=>counter > 0 ? /* @__PURE__ */ h("p", null, "if condition") : null), 
h('$for',array || [],()=>(array || []).map((ele) => /* @__PURE__ */ h("p", { onclick: () => test(ele) }, ele, 
h('$if',ele == 5,()=>ele == 5 && /* @__PURE__ */ h("strong", null, "test if nested"))))));
}
__my_component.register(Component);
