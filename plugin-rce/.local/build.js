import { createConfig, register } from '/rce/client';
let __my_component;
import { $state } from "rce";
const $hook = (_c) => 
function $hook() {
  let bool = _c.set($state(false),['bool']);
  return [bool];
}
function Partial() {
}
function Component({ title = "hello rce" }) {
__my_component = createConfig('my-component', {title});
  let counter = __my_component.set($state(0),['counter']);
  let array = __my_component.set($state([1, 2, 3]),['array']);
  let [bool] = $hook(__my_component)();
  function add() {
    array.push(array.length + 1);
    counter += 1;
    console.log(counter);
    bool = !bool;
    console.log(bool);
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
return /* @__PURE__ */ (__my_component.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", null, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus")),__my_component);;
}
register('my-component', Component);
