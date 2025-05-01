// import { $state } from "../plugin-rce/client/hooks";

const symbols = {
  state: Symbol('state')
}

function $state(init) {

  init.constructor.prototype.symbol = symbols.state;
  return init;
}

function is_state(value) {
  return value.constructor.prototype.symbol === symbols.state
}


function $hook(_c) {

  // reflect function type
  return function () {

    let bool = $state(false);
    _c.bool = bool;

    function invert() {
      let { bool } = _c;
      bool = !bool;
      _c.bool = bool;
    }

    return {
      bool,
      invert
    }

  }

}

const __component = new Proxy({
  state: new Map()
}, {
  set(t, k, v) {

    if (is_state(v) || t.state.has(k)) {
      console.log(t.state.has(k) ? 'update' : 'set', v)
      t.state.set(k, v);
    } else {
      // not a state
      t[k] = v;

    }

    return true;
  },
  get(t, k) {
    if (t.state.has(k)) {
      return t.state.get(k)
    }
    return t[k];
  }
})



function Component(props) {

  __component.counter = $state(0);

  let { bool, invert } = $hook(__component)();

  // who is state

  function method() {
    let { counter, invert } = __component;
    counter += 1;
    invert()

    __component.counter = counter;
    // __component.bool = bool;
  }

  method()


}

function compile(component, ...hooks) {

}

const arrow = () => 


Component()