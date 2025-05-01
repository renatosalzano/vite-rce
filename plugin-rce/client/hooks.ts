const SYMBOLS = {
  STATE: Symbol('state')
}

function $state<T>(init: T) {

  init.constructor.prototype.symbol = SYMBOLS.STATE;

  return init;
}

$state.isState = <T>(value: T) => {
  return value.constructor.prototype?.symbol === SYMBOLS.STATE;
}


export {
  $state
}