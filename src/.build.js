const HelloWorld = ({ title = "hello", number = 1, test = () => null }) => {
  const [counter, setCounter] = $state(0);
  return /* @__PURE__ */ h("hello-world", null, counter > 1 && /* @__PURE__ */ h("h1", { suca: true }, "hello world"), /* @__PURE__ */ h("h1", null, "hello world"), /* @__PURE__ */ h("h1", null, "hello world"), /* @__PURE__ */ h(Partial, { show: true }));
};
const ArrowCustom = (props) => /* @__PURE__ */ h("custom-div", null);
function Partial({ show }) {
  if (show) {
    return /* @__PURE__ */ h("div", null, "bla bla bla");
  }
  return null;
}
const ArrowPartial = () => /* @__PURE__ */ h("div", null, "arrow partial");