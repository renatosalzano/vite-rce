const cache = new WeakMap();

function register(custom_element: Function, name: string) {
  cache.set(custom_element, name);
}

export default register;