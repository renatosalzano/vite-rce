

function $state<T>(init: T): T {

  // const config = ($state as any).current;

  return init;
}

function $onMounted(callback: Function) {
  return callback
}

function $onUnmounted(callback: Function) {
  return callback
}

function $ref(target) {
  return target
}

export {
  $onMounted,
  $onUnmounted,
  $ref,
  $state
}