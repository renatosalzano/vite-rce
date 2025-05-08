import { createConfig, defineElement } from '@rce/dev';
import { $state } from "@rce";
function Test() {
const $ = createConfig('test-component', );
  let counter = $.state(0);
  $.methods = new Set([]);
return /* @__PURE__ */ ($.render = (h) =>h("test-component", null, /* @__PURE__ */ h("div", null, "test component")),$);
}
export { Test };
defineElement('test-component', Test);
