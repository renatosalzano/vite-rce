import { createConfig, defineElement } from '/rce/client';
import { $state } from "rce";
const $hook = ($) => 
function $hook() {
  let bool = $.state(false);
  function method() {
    console.log("working method");
    bool = !bool;
  }
  return {
    bool,
    method
  };
}
function Partial() {
}
export function Component({ title = "hello rce" }){
const $ = createConfig('my-component', {title});
  let counter = $.state(0);
  let other_counter = $.state(0);
  let date = $.state(/* @__PURE__ */ new Date());
  let und = $.state(void 0);
  let array = $.state([1, 2, 3]);
  let { bool, method } = $hook($)();
  function add() {
    method();
    array.push(array.length + 1);
    counter += 1;
    console.log("from component", counter);
    bool = !bool;
    const test2 = 0;
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
  $.methods = new Set([add,minus,plus]);
return /* @__PURE__ */ ($.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", { class: "to do" }, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { onclick: plus }, "plus"), /* @__PURE__ */ h("div", null, "other counter is ", other_counter)), 
h('$for', array || [],((h,parent_index, _index, _arr) => /* @__PURE__ */ h("div", null, "item - ", parent_index)))),$);
};
function StatelessComponent(props) {
const $ = createConfig('custom-div', props);
return ($.render = (h) =>h("custom-div", null, 
h('$if',props.hello,(h)=>props.hello && /* @__PURE__ */ h("span", null, "hello"))),$)};
defineElement('my-component', Component);
defineElement('custom-div', StatelessComponent);
