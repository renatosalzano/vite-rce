import { createConfig, defineElement } from '/rce/client';
import { $state } from "rce";
const $hook = ($) => 
function $hook() {
  let bool = $.state(false);
  function method() {
   let [_bool] = $.get(bool);
 console.log("working method");
    _bool = !_bool;

 $.set([bool], [_bool]);
  }
  return {
    bool,
    method
  };
}
function Partial() {
}
export function Component({ title = "hello rce" }){
const $ = createConfig('my-component', {title});
  let counter = $.state(0);
  let other_counter = $.state(0);
  let date = $.state(/* @__PURE__ */ new Date());
  let und = $.state(void 0);
  let nil = $.state(null);
  let { a: ALIAS, b, c } = $.state({ a: 1, b: 2, c: "pippo" });
  let array = $.state([1, 2, 3]);
  let { bool, method } = $hook($)();
  function add() {
   let [_method,_array,_counter,_bool] = $.get(method,array,counter,bool);
 _method();
    _array.push(_array.length + 1);
    _counter += 1;
    console.log("from component", _counter);
    _bool = !_bool;
    const test2 = 0;

 $.set([method,array,counter,bool], [_method,_array,_counter,_bool]);
  }
  const minus = () => {
   let [_counter,_array,_nil] = $.get(counter,array,nil);
 _counter -= 1;
    _array.pop();
    _nil = null;

 $.set([counter,array,nil], [_counter,_array,_nil]);
  };
  function test(i) {
    console.log(`u click the number ${i}`);
  }
  function plus() {
   let [_other_counter,_ALIAS,_b,_array,_nil] = $.get(other_counter,ALIAS,b,array,nil);
 _other_counter += 1;
    _ALIAS++;
    _b++;
    _array = _array.map((item) => item + 1);
    console.log(_array);
    _nil = "IS DEFINED";

 $.set([other_counter,ALIAS,b,array,nil], [_other_counter,_ALIAS,_b,_array,_nil]);
  }
  const props = {};
  $.methods = new Set([add,minus,plus]);
return /* @__PURE__ */ ($.render = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ h("strong", { class: "to do" }, "counter is ", counter, " ", counter, " ", counter), /* @__PURE__ */ h("button", { onclick: add }, "add"), /* @__PURE__ */ h("button", { onclick: minus }, "minus"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { onclick: plus }, "plus"), /* @__PURE__ */ h("div", null, "other counter is ", other_counter)), 
h('$if',$.get_value(nil) !== null,(c, h)=>c && /* @__PURE__ */ h("span", null, nil)), 
h('$ternary',$.get_value(nil) == null,(c, h)=>c ? null : /* @__PURE__ */ h("span", null, "not null")), 
h('$for', array || [],((h,parent_index, _index, _arr) => /* @__PURE__ */ h("div", null, "item - ", parent_index)))),$);
};
defineElement('my-component', Component);
