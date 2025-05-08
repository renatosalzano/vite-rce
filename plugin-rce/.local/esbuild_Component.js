import { $state } from "@rce";
function $hook() {
  let bool = $state(false);
  function method() {
    console.log("working method");
    bool = !bool;
  }
  return {
    bool,
    method
  };
}
function Partial() {
}
export const Component = ({ title = "hello rce" }) => {
  let show = $state(false);
  let array = $state([1, 2, 3]);
  function add() {
    array.push(array.length + 1);
  }
  const minus = () => {
    array.pop();
  };
  function test(i) {
    console.log(`u click the number ${i}`);
  }
  function toggle_list() {
    show = !show;
  }
  const props = {};
  return /* @__PURE__ */ h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: "flex column" }, /* @__PURE__ */ h("button", { onclick: toggle_list }, "list: ", show ? "true" : "false"), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus")), show && array.map((i) => /* @__PURE__ */ h("div", null, "list item - ", i)));
};
