import { create, register } from "@rce/dev";
import { $state, defineElement } from "@rce";
const $hook = ($) => () => {
  let show = $.state(false);
  function toggle() {
    let [_show] = $([show]);
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
  let array = $.state([1, 2]);
  let { show, toggle } = $hook($)();
  let obj = $.state({
    nested: {
      list: [1, 2, 3]
    }
  });
  function add() {
    let [_array] = $([array]);
    _array.push(_array.length + 1);
    $.set([array], [_array]);
  }
  const minus = () => {
    let [_array] = $([array]);
    _array.pop();
    console.log(_array);
    $.set([array], [_array]);
  };
  const props = {};
  return $.h = (h2) => {
    const [_array, _show, _toggle, _obj] = $([array, show, toggle, obj]);
    return [/* @__PURE__ */ h2("h2", null, "my component"), /* @__PURE__ */ h2("div", { ...props, class: _show ? "show" : _array.length > 0 ? "greater than 0" : "is 0" }, /* @__PURE__ */ h2("button", { onclick: _toggle }, "toggle"), /* @__PURE__ */ h2("button", { onclick: add }, "add"), /* @__PURE__ */ h2("button", { onclick: minus }, "min")), /* @__PURE__ */ h2("div", null, /* @__PURE__ */ h2("strong", null, "counter is ", _array.length)), _array.length > 3 && /* @__PURE__ */ h2("div", null, "random"), _array.map((i) => /* @__PURE__ */ h2("div", null, "item - ", i, i == 2 && /* @__PURE__ */ h2("div", null, "condition by param"), _show ? /* @__PURE__ */ h2("div", null, "show") : "hidden"))];
  }, $;
};
register(Component, "my-component");
;
defineElement(Component);
