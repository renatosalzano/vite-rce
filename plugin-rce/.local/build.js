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
var HYDRATE = "h";
var CONDITIONAL = "i";
var LIST = "f";

// plugin-rce/client/Template.ts
var Template = class {
  $;
  current;
  tree;
  constructor($) {
    this.$ = $;
    this.tree = this.$[HYDRATE](this.object);
    console.log(this.tree);
  }
  object = (tag, props, ...children) => {
    return new ObjectElement(tag, props, children);
  };
  mount = (root) => {
    for (let child of this.tree.children) {
      child = create_element(child);
      root.append(child);
    }
  };
  // create = (tag: string, props: any, ...children: any) => {
  //   // console.log(tag, props, children)
  //   if (tag == this.root.localName) {
  //     this.append(this.root, children);
  //     return;
  //   }
  //   const element = document.createElement(tag);
  //   if (props) {
  //     for (const key in props) {
  //       let value = props[key];
  //       if (value instanceof Mutation) {
  //         // value.set_target(el)
  //         value.set_target('attr', element, key);
  //         value = value.value
  //       }
  //       // console.log(key, value)
  //       if (key.startsWith('on')) {
  //         element[key] = value
  //       } else {
  //         element.setAttribute(key, value)
  //       }
  //     }
  //   }
  //   this.append(element, children);
  //   return element;
  // }
  // append(element: HTMLElement, children: any[]) {
  //   console.log(element, children)
  //   let index = 0;
  //   for (const child of children) {
  //     if (child instanceof Conditional) {
  //       child.set_target('node', element, index);
  //     } else {
  //       element.append(child);
  //     }
  //     ++index;
  //   }
  // }
};
var Mutation = class {
  value;
  set_target = () => {
  };
  constructor(value, set_target) {
    this.value = value;
    if (set_target) this.set_target = set_target;
  }
};
var Conditional = class {
  exec_condition;
  condition;
  slot;
  current;
  target;
  index;
  type;
  node = {
    if: null,
    else: null
  };
  deps;
  unregister = [];
  constructor(condition, _if, _else = null, deps) {
    this.exec_condition = condition;
    this.deps = deps;
    this.condition = condition();
    this.slot = new Comment("$");
    this.node.if = _if;
    this.node.else = _else;
  }
  mount = () => {
    for (const dep of this.deps) {
      this.unregister.push(dep.register(this.update));
    }
    switch (this.type) {
      case "node": {
        this.target = this.condition ? create_element(this.node.if) : create_element(this.node.else);
        return this.target;
      }
      case "attr":
      case "event": {
        return this.condition ? this.node.if : this.node.else;
      }
    }
  };
  unmount = () => {
    for (const unregister of this.unregister) {
      unregister();
    }
  };
  update = () => {
    const condition = this.exec_condition();
    console.log("update");
    if (this.condition != condition) {
    }
  };
  set_type = (type) => {
    this.type = type;
    if (type == "node" && this.node.else == null) {
      this.node.else = this.slot;
    }
  };
};
var List = class {
  result;
  slot;
  node_list = [];
  target;
  child_index = 0;
  constructor(result, deps) {
    this.result = result;
    this.slot = new Comment("$");
    this.node_list = this.result();
    if (this.node_list.length == 0) {
      this.node_list[0] = this.slot;
    }
  }
  create = () => {
    return new Mutation(this.node_list);
  };
  update = () => {
    const node_list = this.result();
    const max_index = Math.max(node_list.length, this.node_list.length);
    let last_element = this.node_list[0];
    for (let index = 0; index < max_index; index++) {
      const element = node_list[index];
      if (index < node_list.length) {
        if (this.node_list[index]) {
          const dom_element = this.node_list[index];
          if (!dom_element.isEqualNode(element)) {
            dom_element.replaceWith(element);
            this.node_list[index] = element;
            last_element = element;
          } else {
            last_element = dom_element;
          }
        } else {
          this.node_list[index] = element;
          last_element.after(element);
          last_element = element;
        }
      } else {
        if (this.node_list.length == 1) {
          this.node_list[0].replaceWith(this.slot);
          this.node_list[0] = this.slot;
        } else {
          this.node_list[index].remove();
          this.node_list.splice(index, 1);
        }
      }
    }
  };
  mutation = (target) => {
    target.append(...this.node_list);
  };
};
var ObjectElement = class {
  tag;
  props;
  children;
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props;
    this.children = children;
    for (const key in props ?? {}) {
      const value = props[key];
      if (value instanceof Conditional) {
        if (key.startsWith("on")) {
          value.type = "event";
          console.log("EVENT", value);
        } else {
          value.type = "attr";
        }
      }
    }
    for (const child of children) {
      if (child instanceof Conditional) {
        child.set_type("node");
      }
      if (child instanceof List) {
      }
    }
  }
};
function create_element(init, index = 0) {
  switch (init.constructor) {
    case Comment:
      return init;
    case String:
      return new Text(init);
    case ObjectElement: {
      const { tag, props, children } = init;
      const element = document.createElement(tag);
      for (const key in props ?? {}) {
        let value = props[key];
        if (value instanceof Conditional) {
          value = value.mount();
        }
        if (key.startsWith("on")) {
          element[key] = value;
        } else {
          element.setAttribute(key, value);
        }
      }
      let child_index = 0;
      for (let child of children) {
        child = create_element(child, child_index);
        element.append(child);
        ++child_index;
      }
      return element;
    }
    case Conditional: {
      return init.mount();
    }
    case List: {
    }
  }
}

// plugin-rce/client/create.ts
var REACTIVE = Symbol("react");
function create(props) {
  const $ = {
    props,
    state_map: [],
    template: {},
    state(value) {
      const index = this.state_map.length;
      this.state_map[index] = {
        value,
        index,
        mutations: [],
        $$type: REACTIVE,
        register(notify) {
          const index2 = this.mutations.push(notify) - 1;
          return () => {
            this.mutations.splice(index2, 1);
          };
        }
      };
      return this.state_map[index];
    },
    is_state(value) {
      if (typeof value == "object" && value?.$$type == REACTIVE) return true;
      return false;
    },
    get_state(value) {
      return value.value;
    },
    set_state(state, value) {
      this.state_map[state.index].value = value;
      for (const update of this.state_map[state.index].mutations) {
        update();
      }
    },
    get(...getters) {
      return getters.map((getter) => {
        if (this.is_state(getter)) {
          return this.get_state(getter);
        }
        return getter;
      });
    },
    set(setters, getters) {
      let index = 0;
      for (const setter of setters) {
        if (this.is_state(setter)) {
          this.set_state(setter, getters[index]);
        }
        index++;
      }
    },
    [GET_VALUE](value) {
      if (this.is_state(value)) {
        return this.get_state(value);
      }
      return value;
    },
    [HYDRATE](_) {
    },
    [CONDITIONAL](condition, deps, _if, _else) {
      return new Conditional(condition, _if, _else, deps);
    },
    [LIST](result, deps) {
      return new List(result, deps);
    },
    init() {
      this.template = new Template(this);
      return this.template;
    },
    register(reactive, notify) {
      const index = reactive.mutations.push(notify) - 1;
      return () => {
        reactive.mutations.splice(index, 1);
      };
    }
    // template: (() => {
    //   $.template = new Template($);
    //   return $.template;
    // }) as any,
  };
  const ret = Object.assign((value) => {
    if ($.is_state(value)) {
      return $.get_state(value);
    }
    return value;
  }, $);
  return ret;
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
        const template = config.init();
        instances.set(this, { config, template });
      }
      connectedCallback() {
        console.log("mounted");
        const { template } = instances.get(this);
        template.mount(this);
      }
      setProps(props) {
      }
    }
  );
}
var defineElement_default = defineElement;

// plugin-rce/client/hooks.ts
function $state(init) {
  return init;
}
export {
  $state,
  create_default as create,
  defineElement_default as defineElement,
  register_default as register
};
