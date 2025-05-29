import { create, register } from '@rce/dev';
import { $state, $ref, defineElement } from "@rce";
const $hook = ($) =>()=> {
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
}
const $hook2 = ($) =>() => {
  let test = $.state(false);
  return {
    test
  };
};


const Partial = ($) =>(h,props) => {
  return /* @__PURE__ */ h("ul", null, props.list.map((i) => /* @__PURE__ */ h("li", null, "item ", i)));
};
const Button = ($) =>function (h,{ onclick, children }) {
  return /* @__PURE__ */ h("button", { onclick }, children);
}
export const Component = ({ title = "hello rce" }) => {
 const $ = create({ title });
  let array = $.state([]);
  let nested = $.state([]);
  let { show, toggle } = $hook($)();
  const ref = $.ref(null);
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
  const test = () => {
let [_array] = $([array]);

    _array.pop();
    console.log(_array);
  
$.set([array], [_array]);
};
  const obj = {
    show:$(show),
    usless: true
  };
  const props = {
    obj,
    onclick: add,
    test: {
      nested: {
        key: $(array).lenght
      }
    }
  };
  return /* @__PURE__ */ $.h = (h) => [ /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("div", { class: $(show) ? "show" : $(array).length > 0 ? "greater than 0" : "is 0" }, /* @__PURE__ */ h("button", { ...props }, "add")), /* @__PURE__ */ h("p", null, "counter ", $(array).length), "ROOT COUNTER ", $(array).length], $;
}
register(Component, 'my-component');
;
defineElement(Component);
