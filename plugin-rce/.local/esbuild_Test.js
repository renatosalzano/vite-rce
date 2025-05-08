import { $state } from "@rce";
function Test() {
  let counter = $state(0);
  return /* @__PURE__ */ h("test-component", null, /* @__PURE__ */ h("div", null, "test component"));
}
export { Test };
