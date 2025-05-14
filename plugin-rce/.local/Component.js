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
    /* @__PURE__ */ h2("div", { class: $.i(() => $(show), [show], "show", "hidden") }, /* @__PURE__ */ h2("button", { onclick: toggle }, "toggle"), /* @__PURE__ */ h2(
      "button",
      { onclick: $.i(() => $(show), [show], add, minus) },
      $.i(() => $(show), [show], "add", "minus")
    ), /* @__PURE__ */ h2(
      "button",
      { onclick: $.i(() => $(show), [show], add, null) },
      $.i(() => $(show), [show], "add", "nothing"),
      " ",
      $.i(() => $(show), [show], "add something")
    )),
    $.i(() => !$(show), [show], /* @__PURE__ */ h2(
      "div",
      null,
      $.i(() => $(array).length > 0, [array], /* @__PURE__ */ h2(
        "div",
        null,
        "nested",
        $.i(() => $(array).length > 1, [array], /* @__PURE__ */ h2("div", null, "neested 1"))
      ))
    ))
  ), $;
};
register(Component, "my-component");
;
defineElement(Component);
