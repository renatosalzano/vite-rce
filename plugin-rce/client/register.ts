const cache = new WeakMap();

function register(custom_element: Function, name: string) {
  console.log(custom_element)
  cache.set(custom_element, name);
}

export function get_name(custom_element: Function) {
  return cache.get(custom_element);
}

export default register;