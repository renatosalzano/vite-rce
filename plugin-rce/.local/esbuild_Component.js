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
  let array = $state([1, 2, 3]);
  let state = $state(true);
  const { show, toggle } = $hook();
  function add() {
    array.push(array.length + 1);
  }
  const minus = () => {
    array.pop();
  };
  function test() {
    array = array.map((i) => i + 1);
  }
  const props = {};
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), show ? /* @__PURE__ */ h("div", null, array.length > 0 ? "full" : "empty") : "hidden", show && /* @__PURE__ */ h("div", null, array.length > 0 && "array is greater than 0"));
};
defineElement(Component);
