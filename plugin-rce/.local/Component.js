import { create, register } from "@rce/dev";
import { $state, defineElement } from "@rce";
const $hook = ($) => () => {
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
};
const $hook2 = ($) => () => {
  let test = $.state(false);
  return {
    test
  };
};
const Partial = (props) => {
  return /* @__PURE__ */ h("ul", null, props.list.map((i) => /* @__PURE__ */ h("li", null, "item ", i)));
};
export const Component = ({ title = "hello rce" }) => {
  const $ = create({ title });
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
  return $.h = (h2) => (/* @__PURE__ */ h2("h2", null, "my component"), $.if($.v(show), [show], () => h2(
    "div",
    null,
    $.if($.v(array).length > 0, [array], "full", "empty")
  ), "hidden"), $.if($.v(show), [show], () => h2(
    "div",
    null,
    $.if($.v(array).length > 0, [array], "array is greater than 0")
  ))), $;
};
register(Component, "my-component");
;
defineElement(Component);
