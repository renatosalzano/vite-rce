const SYMBOLS = {
  STATE: Symbol('state')
}

function $state<T>(init: T) {

  Object.assign(init.constructor, { $$type: SYMBOLS.STATE })

  return init;
}

$state.isState = <T>(value: T) => {
  return value?.constructor && value.constructor?.['$$type'] === SYMBOLS.STATE;
}


export {
  $state
}