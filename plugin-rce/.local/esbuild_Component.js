import { $state } from "@rce";
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
function $if(condition, jsx) {
  return condition && jsx;
}
function $list(value, fn) {
  return;
}
function $entries(value, fn) {
  return;
}
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
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), $if(show, /* @__PURE__ */ h("div", null)), $entries({ a: 1, b: 2 }, (key, value) => key == "a"), /* @__PURE__ */ h(Partial, { list: array }));
};
const StatelessComponent = (props) => /* @__PURE__ */ h("custom-div", null, props.hello && /* @__PURE__ */ h("span", null, "hello"));
function FuncComponent() {
  return /* @__PURE__ */ h("custom-div", null, /* @__PURE__ */ h("div", null, "custom div"));
}
