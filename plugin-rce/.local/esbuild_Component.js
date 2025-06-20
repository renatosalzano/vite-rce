import { $state, $ref, defineElement } from "@rce";
function $hook(ref) {
  let show = $state(false);
  function toggle() {
    show = !show;
    console.log(ref);
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
function Button({ onclick, children }) {
  return /* @__PURE__ */ h("button", { onclick }, children);
}
export const Component = ({ title = "hello rce" }) => {
  const ref = $ref(null);
  let array = $state([1, 2]);
  let { show, toggle } = $hook(ref);
  function add() {
    array.push(array.length + 1);
  }
  const minus = () => {
    array.pop();
    console.log(array);
  };
  const test = () => {
    array.pop();
    console.log(array);
  };
  const obj = {
    show,
    usless: true
  };
  const props = {
    obj,
    onclick: add,
    test: {
      nested: {
        key: array.lenght
      }
    }
  };
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: show ? "show" : array.length > 0 ? "greater than 0" : "is 0" }, /* @__PURE__ */ h("button", { ref, onclick: toggle }, "toggle"), /* @__PURE__ */ h("button", { ...props }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "min")), show ? /* @__PURE__ */ h("div", null, "show") : null, array.map((i) => /* @__PURE__ */ h("div", null, "level 0 - ", i, show ? /* @__PURE__ */ h("div", null, "show") : null)));
};
defineElement(Component);
