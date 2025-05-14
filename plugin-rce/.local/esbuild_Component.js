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
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: show ? "show" : "hidden" }, /* @__PURE__ */ h("button", { onclick: toggle }, "toggle"), /* @__PURE__ */ h("button", { onclick: show ? add : minus }, show ? "add" : "minus"), /* @__PURE__ */ h("button", { onclick: show ? add : null }, show ? "add" : "nothing", " ", show && "add something")), !show && /* @__PURE__ */ h("div", null, array.length > 0 && /* @__PURE__ */ h("div", null, "nested", array.length > 1 && /* @__PURE__ */ h("div", null, "neested 1"))));
};
defineElement(Component);
