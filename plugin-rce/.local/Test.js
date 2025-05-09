import { createConfig, defineElement } from '@rce/dev';
import { $state } from "@rce";
function Test() {
const $ = createConfig('test-component', );
  let counter = $.state(0);
  return /* @__PURE__ */ ($.h = (h) =>h("test-component", null, /* @__PURE__ */ h("div", null, "test component")),$);
}
export { Test };
defineElement('test-component', Test);
