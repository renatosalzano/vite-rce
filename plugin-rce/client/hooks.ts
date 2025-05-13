

function $state<T>(init: T): T {

  // const config = ($state as any).current;

  return init;
}

type array = Array<unknown>


function $for<T extends object>(
  value: T,
  foreach: (value: T[keyof T], key: keyof T) => any
): unknown;
function $for<T extends array | object>(
  value: T,
  foreach: (
    _item: T extends array ? T[number] : T[keyof T],
    _index: T extends array ? number : keyof T
  ) => any
) {

  return null
}

export {
  $for,
  $state
}