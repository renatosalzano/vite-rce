import { createConfig, defineElement } from '@rce/dev';
import { $state } from "@rce";
const $hook = ($) => 
function $hook() {
  let show = $.state(false);
  function toggle() {
   let [_show] = $.get(show);
 _show = !_show;

 $.set([show], [_show]);
  }
  return {
    show,
    toggle
  };
}
function Partial(props) {
  return /* @__PURE__ */ h("ul", null, props.list.map((i) => /* @__PURE__ */ h("li", null, "item ", i)));
}
export function Component({ title = "hello rce" }){
const $ = createConfig('my-component', {title});
  let array = $.state([1, 2, 3]);
  let state = $.state(true);
  const { show, toggle } = $hook($)();
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
  function test() {
   let [_array] = $.get(array);
 _array = _array.map((i) => i + 1);

 $.set([array], [_array]);
  }
  const props = {};
  return /* @__PURE__ */ ($.h = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: "flex column" }, /* @__PURE__ */ h("button", { onclick: toggle }, "list: ", $.v(show) ? $.r("true") : $.r("false")), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), /* @__PURE__ */ h("button", { onclick: test }, "test")), /* @__PURE__ */ h(Partial, { list: array })),$);
};
defineElement('my-component', Component);
