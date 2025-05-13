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
  let show = $.state(false);
  let array = $.state([1, 2, 3]);
  let obj = $.state({
    nested: {
      list: [1, 2, 3]
    }
  });
  function add() {
    let [_array] = $.get(array);
    _array.push(_array.length + 1);
    $.set([array], [_array]);
  }
  const minus = () => {
    let [_array] = $.get(array);
    _array.pop();
    console.log(_array);
    $.set([array], [_array]);
  };
  function toggle() {
    let [_show] = $.get(show);
    _show = !_show;
    console.log("show", _show);
    $.set([show], [_show]);
  }
  const props = {};
  return $.h = (h2) => h2(
    "my-component",
    null,
    /* @__PURE__ */ h2("h2", null, "my component"),
    /* @__PURE__ */ h2("div", { class: $.if(() => $.v(show), [show], "show", "hidden") }, /* @__PURE__ */ h2("button", { onclick: toggle }, "toggle"), /* @__PURE__ */ h2("button", { onclick: add }, "add"), /* @__PURE__ */ h2("button", { onclick: minus }, "minus")),
    $.if(() => $.v(show), [show], /* @__PURE__ */ h2(
      "div",
      null,
      $.if(() => $.v(array).length > 0, [array], "full", "empty")
    ), "hidden"),
    $.if(() => $.v(show), [show], /* @__PURE__ */ h2(
      "div",
      null,
      $.if(() => $.v(array).length > 0, [array], "array is greater than 0")
    )),
    $.for(() => $.v(array).map((i) => /* @__PURE__ */ h2(
      "div",
      null,
      "item - ",
      i,
      $.if(() => i == 2, [], /* @__PURE__ */ h2("div", null, "condition by param")),
      $.if(() => $.v(show), [show], /* @__PURE__ */ h2("div", null, "show"), "hidden")
    )), [array])
  ), $;
};
register(Component, "my-component");
;
defineElement(Component);
