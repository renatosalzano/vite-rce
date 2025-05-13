import { $state, defineElement } from "@rce";
function $hook() {
  let show = $state(false);
  function toggle() {
    show = !show;
  }
  return {
    show,
    toggle
  };
}
const $hook2 = () => {
  let test = $state(false);
  return {
    test
  };
};
const $invalid_hook = () => null;
function $delete_me() {
}
const Partial = (props) => {
  return /* @__PURE__ */ h("ul", null, props.list.map((i) => /* @__PURE__ */ h("li", null, "item ", i)));
};
export const Component = ({ title = "hello rce" }) => {
  let show = $state(false);
  let array = $state([1, 2, 3]);
  let obj = $state({
    nested: {
      list: [1, 2, 3]
    }
  });
  function add() {
    array.push(array.length + 1);
  }
  const minus = () => {
    array.pop();
    console.log(array);
  };
  function toggle() {
    show = !show;
    console.log("show", show);
  }
  const props = {};
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: show ? "show" : "hidden" }, /* @__PURE__ */ h("button", { onclick: toggle }, "toggle"), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus")), show ? /* @__PURE__ */ h("div", null, array.length > 0 ? "full" : "empty") : "hidden", show && /* @__PURE__ */ h("div", null, array.length > 0 && "array is greater than 0"), array.map((i) => /* @__PURE__ */ h("div", null, "item - ", i, i == 2 && /* @__PURE__ */ h("div", null, "condition by param"), show ? /* @__PURE__ */ h("div", null, "show") : "hidden")));
};
defineElement(Component);
