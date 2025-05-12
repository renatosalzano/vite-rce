// plugin-rce/client/register.ts
var cache = /* @__PURE__ */ new WeakMap();
function register(custom_element, name) {
  console.log(custom_element);
  cache.set(custom_element, name);
}
function get_name(custom_element) {
  return cache.get(custom_element);
}
var register_default = register;

// plugin-rce/constant.ts
var CONFIG_ID = "$";
var HOOK_START = "$";
var STATE = `${HOOK_START}state`;
var TEMPLATE_CONDITIONAL_EXPRESSION = `${CONFIG_ID}.ce`;
var GET_VALUE = "v";
var CREATE_REACTIVE_VALUE = "r";
var CONDITIONAL = "if";

// plugin-rce/client/create.ts
var REACTIVE = Symbol("react");
function create(element_name, props) {
  const $ = {
    element_name,
    props,
    state_map: [],
    state(value) {
      const index = $.state_map.length;
      $.state_map[index] = {
        value,
        index,
        $$type: REACTIVE
      };
      return $.state_map[index];
    },
    is_state(value) {
      if (typeof value == "object" && value?.$$type == REACTIVE) return true;
      return false;
    },
    get_state(value) {
      return value.value;
    },
    set_state(state, value) {
      $.state_map[state.index].value = value;
    },
    create_state(value) {
      return {
        value,
        $$type: REACTIVE
      };
    },
    get(...getters) {
      return getters.map((getter) => {
        if ($.is_state(getter)) {
          return $.get_state(getter);
        }
        return getter;
      });
    },
    set(setters, getters) {
      let index = 0;
      for (const setter of setters) {
        if ($.is_state(setter)) {
          $.set_state(setter, getters[index]);
        }
        index++;
      }
      $.update();
    },
    [GET_VALUE](value) {
      if ($.is_state(value)) {
        return $.get_state(value);
      }
      return value;
    },
    [CREATE_REACTIVE_VALUE](value) {
      return {
        value,
        $$type: REACTIVE
      };
    },
    [CONDITIONAL](condition, deps, left_node, right_node) {
    },
    update: () => {
    }
  };
  return $;
}
var create_default = create;

// plugin-rce/client/defineElement.ts
function defineElement(component) {
  const name = get_name(component);
  const instances = /* @__PURE__ */ new WeakMap();
  console.log("define", name);
  window.customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const config = component({});
        instances.set(this, { config });
      }
      connectedCallback() {
        console.log("mounted");
      }
      setProps(props) {
      }
    }
  );
}
var defineElement_default = defineElement;

// plugin-rce/client/Template.ts
var Template = class {
  // mutations = new Mutations();
  $ = {};
  cache = new Cache_default(this);
  // cached = new Map<number, (HTMLElement | ConditionalTemplate | ListTemplate)>();
  // element_checked = new Set<number>();
  constructor(config) {
    this.$ = config;
  }
  init = () => {
    this.cache.start();
    this.$.h(this.init_cache);
    this.$.update = this.update;
  };
  update = () => {
    console.log("update", this);
    this.cache.start();
    this.$.h(this.h);
  };
  init_cache = (tag, props, ...children) => {
    switch (tag) {
      case "$if":
        this.cache.set(new ConditionalTemplate(this.$, props, children[0]));
        return;
      case "$for":
        this.cache.set(new ListTemplate(this.$, props, children[0]));
        return;
    }
    this.check_mutations(props, children);
    this.cache.next();
  };
  check_mutations(props, children) {
    let node_index = 0;
    for (const child of children) {
      if (this.$.is_state(child)) {
        this.cache.mutation({ type: "text_node", node_index });
      }
      node_index++;
    }
    this.cache.mutations_is_checked();
  }
  // cache = (element: HTMLElement | ConditionalTemplate | ListTemplate) => {
  //   this.cached.set(this.index, element);
  //   this.index++;
  // }
  // #region Hidrate
  h = (tag, props, ...children) => {
    if (tag == this.$.element_name) {
      return children;
    }
    if (this.cache.has()) {
      const element = this.cache.get();
      if (is_directive(element)) {
        if (this.$.is_state(props)) {
          props = this.$.get_state(props);
        }
        const result = element.element(props);
        this.cache.next();
        return result;
      }
      if (this.cache.mutations_not_checked()) {
        this.check_mutations(props, children);
      }
      if (this.cache.has_mutations()) {
        this.cache.apply_mutation(this.$, element, props, children);
      }
      this.cache.next();
      return element;
    } else {
      if (is_directive(tag)) {
        const directive = tag == "$for" ? new ListTemplate(this.$, props, children[0]) : new ConditionalTemplate(this.$, props, children[0]);
        this.cache.set(directive);
        return directive.element(props);
      }
      return this.create_element(tag, props, children);
    }
  };
  create_element = (tag, props, children) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(props ?? {})) {
      if (name.startsWith("on") && typeof value == "function") {
        element[name] = value;
      } else {
        element.setAttribute(name, value);
      }
    }
    for (const child of children) {
      if (this.$.is_state(child)) {
        element.append(this.$.get_state(child));
      } else if (Array.isArray(child)) {
        element.append(...child);
      } else {
        element.append(child);
      }
    }
    this.cache.set(element);
    return element;
  };
  append = (root) => {
    this.cache.start();
    const elements = this.$.h(this.h);
    for (const element of elements) {
      root.append(element);
    }
  };
};
var ConditionalTemplate = class extends Template {
  type;
  target;
  condition;
  placeholder;
  render;
  constructor($, condition, render) {
    super($);
    this.render = render;
    this.placeholder = document.createComment("$if");
    this.target = this.placeholder;
    this.condition = condition;
    this.cache.start();
    this.render(this.init_cache);
  }
  element = (condition) => {
    this.cache.start();
    let result = this.render(this.h);
    if (this.condition != condition) {
      this.condition = condition;
      if (condition) {
        if (Array.isArray(result)) {
          const fragment = new DocumentFragment();
          fragment.append(...result);
          this.target.replaceWith(fragment);
        } else {
          this.target.replaceWith(result);
        }
        this.target = result;
      } else {
        if (Array.isArray(result)) {
          for (const element of result) {
            if (!this.placeholder.isConnected) {
              element.replaceWith(this.placeholder);
            } else {
              element.remove();
            }
          }
        } else {
          this.target.replaceWith(this.placeholder);
        }
        this.target = this.placeholder;
      }
    }
    return this.target;
  };
};
var ListTemplate = class extends Template {
  node_list = /* @__PURE__ */ new Map();
  placeholder;
  render;
  fragment;
  first_render = true;
  constructor($, array, render) {
    super($);
    this.render = render;
    this.placeholder = document.createComment("$for");
    const item = this.$.is_state(array) ? this.$.create_state(array[0]) : array[0];
    this.cache.start();
    this.render(this.init_cache, item, 0, array);
    this.node_list.set(0, this.placeholder);
  }
  element = (array) => {
    const node_list = [];
    const max_index = Math.max(array.length, this.node_list.size);
    let last_element = this.node_list.get(0);
    this.cache.start_list();
    for (let index = 0; index < max_index; index++) {
      if (index < array.length) {
        const item = array[index];
        this.cache.start();
        const element = this.render(this.h, item, index, array);
        if (this.node_list.has(index)) {
          const dom_element = this.node_list.get(index);
          if (!dom_element.isEqualNode(element)) {
            dom_element.replaceWith(element);
            this.node_list.set(index, element);
            last_element = element;
          } else {
            last_element = dom_element;
          }
        } else {
          this.node_list.set(index, element);
          last_element.after(element);
          last_element = element;
        }
        node_list.push(last_element);
      } else {
        if (this.node_list.size == 1) {
          this.node_list.get(0).replaceWith(this.placeholder);
          this.node_list.set(0, this.placeholder);
        } else {
          this.node_list.get(index).remove();
          this.node_list.delete(index);
        }
      }
      this.cache.next(true);
    }
    return node_list;
  };
};
function is_directive(element) {
  if (typeof element == "string") {
    switch (element) {
      case "$if":
      case "$ternary":
      case "$for":
        return true;
    }
  }
  return element instanceof ConditionalTemplate || element instanceof ListTemplate;
}

// plugin-rce/client/Cache.ts
var Cache = class {
  cached = /* @__PURE__ */ new Map();
  mutations = new Mutations();
  mutations_checked = /* @__PURE__ */ new Set();
  cache_list = false;
  index = 0;
  list_index = 0;
  constructor(instance) {
    this.cache_list = instance instanceof ListTemplate;
  }
  set = (element) => {
    if (this.cache_list) {
      const cached = this.cached_list();
      cached.set(this.index, element);
      this.index++;
      return;
    }
    this.cached.set(this.index, element);
    this.index++;
  };
  next = (list_index = false) => {
    if (list_index) {
      this.list_index++;
    } else {
      this.index++;
    }
  };
  has = () => {
    if (this.cache_list) {
      const cached = this.cached_list();
      return cached.has(this.index);
    }
    return this.cached.has(this.index);
  };
  get = () => {
    if (this.cache_list) {
      const cached = this.cached_list();
      return cached.get(this.index);
    }
    return this.cached.get(this.index);
  };
  start = () => {
    this.index = 0;
  };
  start_list = () => {
    this.list_index = 0;
  };
  set_list_index = (index) => {
    this.list_index = index;
  };
  cached_list = () => {
    if (!this.cached.has(this.list_index)) {
      this.cached.set(this.list_index, /* @__PURE__ */ new Map());
    }
    return this.cached.get(this.list_index);
  };
  clear_list = () => {
    if (this.cached.has(this.list_index)) {
      this.cached.delete(this.list_index);
    }
  };
  mutations_is_checked = () => {
    this.mutations_checked.add(this.index);
  };
  mutations_not_checked = () => {
    return !this.mutations_checked.has(this.index);
  };
  has_mutations = () => {
    return this.mutations.has(this.index);
  };
  get_mutations = () => {
    return this.mutations.get(this.index);
  };
  mutation = (mutation) => {
    this.mutations.set(this.index, mutation);
  };
  apply_mutation = ($, element, props, child_nodes) => {
    for (const mutation of this.mutations.get(this.index)) {
      switch (mutation.type) {
        case "text_node": {
          const value = $[GET_VALUE](child_nodes[mutation.node_index]);
          if (element.childNodes[mutation.node_index].textContent != value) {
            element.childNodes[mutation.node_index].textContent = value;
          }
          break;
        }
      }
    }
  };
};
var Mutations = class {
  mutations = /* @__PURE__ */ new Map();
  set(index, mutation) {
    if (this.mutations.has(index)) {
      this.mutations.get(index).push(mutation);
    } else {
      this.mutations.set(index, [mutation]);
    }
  }
  has(index) {
    return this.mutations.has(index);
  }
  get(index) {
    return this.mutations.get(index);
  }
};
var Cache_default = Cache;

// plugin-rce/client/hooks.ts
function $state(init) {
  return init;
}
export {
  $state,
  Cache_default as Cache,
  ConditionalTemplate,
  ListTemplate,
  Template,
  create_default as create,
  defineElement_default as defineElement,
  register_default as register
};
