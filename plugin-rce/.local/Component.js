import { createConfig, defineElement } from '@rce/dev';
import { $state } from "@rce";
const $hook = ($) => 
function $hook() {
  let bool = $.state(false);
  function method() {
   let [_bool] = $.get(bool);
 console.log("working method");
    _bool = !_bool;

 $.set([bool], [_bool]);
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
  let show = $.state(false);
  let array = $.state([1, 2, 3]);
  function add() {
   let [_array] = $.get(array);
 _array.push(_array.length + 1);

 $.set([array], [_array]);
  }
  const minus = () => {
   let [_array] = $.get(array);
 _array.pop();

 $.set([array], [_array]);
  };
  function test(i) {
    console.log(`u click the number ${i}`);
  }
  function toggle_list() {
   let [_show] = $.get(show);
 _show = !_show;

 $.set([show], [_show]);
  }
  const props = {};
  $.methods = new Set([add,minus,toggle_list]);
return /* @__PURE__ */ ($.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: "flex column" }, /* @__PURE__ */ h("button", { onclick: toggle_list }, "list: ", $.v(show) ? $.r("true") : $.r("false")), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus")), 
h('$if',$.v(show),(h)=> 
h('$for', array,((h,i) => /* @__PURE__ */ h("div", null, "list item - ", i))))),$);
};
defineElement('my-component', Component);
