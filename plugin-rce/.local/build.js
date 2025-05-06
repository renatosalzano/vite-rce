import { createConfig, defineElement } from '/rce/client';
let __my_component;
let __custom_div;
import { $state } from "rce";
const $hook = (_c) => 
function $hook() {
  let bool = _c.set($state(false));
  return [bool];
}
function Partial() {
}
function Component({ title = "hello rce" }){
__my_component = createConfig('my-component', {title});
  let counter = __my_component.set($state(0));
  let other_counter = __my_component.set($state(0));
  let array = __my_component.set($state([1, 2, 3]));
  let [bool] = $hook(__my_component)();
  function add() {
    array.push(array.length + 1);
    counter += 1;
    bool = !bool;
  }
  const minus = () => {
    counter -= 1;
    array.pop();
  };
  function test(i) {
    console.log(`u click the number ${i}`);
  }
  function plus() {
    other_counter += 1;
  }
  const props = {};
  __my_component.methods = new Set([add,minus,plus]);
__my_component.batch = () => ({counter,other_counter,array});
return /* @__PURE__ */ (__my_component.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", { class: "to do" }, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { onclick: plus }, "plus")), 
h('$for', array || [],((h,i, _index, _arr) => /* @__PURE__ */ h("p", { onclick: () => test(i) }, /* @__PURE__ */ h("span", null, "item ", i), 
h('$if',i == 2,(h)=>i == 2 && /* @__PURE__ */ h("strong", null, "test if nested")))))),__my_component);
};
function StatelessComponent(props) {
__custom_div = createConfig('custom-div', props);
return (__custom_div.render = (h) =>h("custom-div", null, 
h('$if',props.hello,(h)=>props.hello && /* @__PURE__ */ h("span", null, "hello"))),__custom_div)};
defineElement('my-component', Component);
defineElement('custom-div', StatelessComponent);
