import { create, defineComponent } from '@rce/dev';
import { $state } from "@rce";
const $hook = ($) =>()=> {
  let show = $.state(false);
  function toggle() {
   	let [_show] = $.get(show);
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


const Partial = (props) => {
  return /* @__PURE__ */ h("ul", null, props.list.map((i) => /* @__PURE__ */ h("li", null, "item ", i)));
};
export const Component = ({ title = "hello rce" }) => {
 const $ = create({ title }, 'my-component');
  let array = $.state([1, 2, 3]);
  let state = $.state(true);
  const { show, toggle } = $hook($)();
  function add() {
   	let [_array] = $.get(array);
 _array.push(_array.length + 1);

	$.set([array], [_array]);
  }
  const minus = () => {
   	let [_array] = $.get(array);
 _array.pop();

	$.set([array], [_array]);
  };
  function test() {
   	let [_array] = $.get(array);
 _array = _array.map((i) => i + 1);

	$.set([array], [_array]);
  }
  const props = {};
  return /* @__PURE__ */ $.h = (h) =>h("my-component", null, /* @__PURE__ */ h("h2", null, "my component"), /* @__PURE__ */ Partial({ list: array })), $;
};
const StatelessComponent = (props) => /* @__PURE__ */ {
 const $ = create(props, 'custom-div');
 return $.h = (h) =>h("custom-div", null, 
h('$if',props.hello,(h)=> /* @__PURE__ */ h("span", null, "hello"))), $
};
function FuncComponent() {
 const $ = create(null, 'custom-div');
  return /* @__PURE__ */ $.h = (h) =>h("custom-div", null, /* @__PURE__ */ h("div", null, "custom div")), $;
}
register();
register();
