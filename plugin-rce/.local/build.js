// plugin-rce/client/register.ts
var cache = /* @__PURE__ */ new WeakMap();
function register(custom_element, name) {
  cache.set(custom_element, name);
}
function get_name(custom_element) {
  return cache.get(custom_element);
}
var register_default = register;

// plugin-rce/constant.ts
var HOOK_START = "$";
var STATE = `${HOOK_START}state`;
var HYDRATE = "h";
var HOOK_REF = `${HOOK_START}ref`;

// plugin-rce/client/Template.ts
var Template = class {
  $;
  root;
  vdom = {
    prev: [],
    curr: []
  };
  dom = [];
  partials = /* @__PURE__ */ new Map();
  mounted = false;
  constructor($, root) {
    $.render = this.render;
    this.$ = $;
    this.root = root;
  }
  object = (tag, props, ...children) => {
    if (typeof tag == "function") {
      if (!this.partials.has(tag.name)) {
        this.partials.set(tag.name, tag(this.$));
      }
      const h = this.partials.get(tag.name);
      if (children.length > 0) {
        props.children = children;
      }
      return h(this.object, Object.freeze(props));
    } else {
      return new Element(tag, props, children);
    }
  };
  render = () => {
    this.vdom.curr = this.$[HYDRATE](this.object);
    let offset = 0;
    for (let i = 0; i < this.vdom.curr.length; i++) {
      const curr = this.vdom.curr[i];
      try {
        if (this.mounted) {
          const prev = this.vdom.prev[i];
          if (is_empty(prev) && is_empty(curr)) {
            offset--;
          } else {
            log(this.dom[i]);
            this.dom[i] = this.update(
              this.dom[i],
              prev,
              curr,
              this.root,
              i + offset
            );
            if (is_array(curr)) {
              offset += Math.min(0, curr.length - 1);
            }
            if (!is_empty(prev) && is_empty(curr)) {
              offset--;
            }
          }
        } else {
          this.dom[i] = this.create(curr);
          this.append(this.root, this.dom[i]);
          if (is_array(curr)) {
            this.dom[i] = this.root.childNodes;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    console.log(this.vdom.prev, this.vdom.curr, this.dom);
    this.mounted = true;
    this.vdom.prev = this.vdom.curr;
  };
  create = (item) => {
    if (item == null) return null;
    switch (item.constructor) {
      case Element: {
        const { tag, props, events, children } = item;
        const element = document.createElement(tag);
        for (const key in props) {
          element.setAttribute(key, props[key]);
        }
        for (const key in events) {
          element[key] = events[key];
        }
        for (const child of children) {
          this.append(element, this.create(child));
        }
        return element;
      }
      case Number:
      case String: {
        return item;
      }
      case Array: {
        return item.map((e) => this.create(e));
      }
      default:
        return null;
    }
  };
  update = (node, prev, curr, parent, index) => {
    if (is_empty(curr)) {
      if (is_node(node)) {
        node.remove();
      }
      if (is_node_list(node)) {
        node[index].remove();
        return node;
      }
      return null;
    }
    switch (curr.constructor) {
      case Element: {
        if (node == null) {
          const res = this.create(curr);
          this.append_at(parent, res, index);
          return res;
        }
        if (is_text_node(node)) {
          node.replaceWith(this.create(curr));
          return node;
        }
        if (is_html(node)) {
          const { props, events, children } = curr;
          for (const attr of node.attributes) {
            if (attr.name in props) {
              if (attr.value != props[attr.name]) {
                node.setAttribute(attr.name, props[attr.name]);
              }
            } else {
              node.removeAttribute(attr.name);
            }
          }
          for (const key in events) {
            node[key] = typeof events[key] == "function" ? events[key] : null;
          }
          const prev_children = prev.children;
          let offset = 0;
          for (let i = 0; i < children.length; i++) {
            if (is_empty(prev_children[i]) && is_empty(children[i])) {
              offset--;
            } else {
              const node_index = i + offset;
              this.update(
                is_array(children[i]) ? node.childNodes : node.childNodes[node_index] ?? null,
                prev_children[i] || false,
                children[i],
                node,
                node_index
              );
              if (is_array(children[i])) {
                offset += Math.min(0, children[i].length - 1);
              }
              if (!is_empty(prev_children[i]) && is_empty(children[i])) {
                offset -= 1;
              }
            }
          }
        }
        return node;
      }
      // #region List
      case Array: {
        const max = Math.max(prev.length, curr.length);
        for (let i = 0; i < max; i++) {
          if (i < curr.length) {
            this.update(
              node[i + index] || null,
              prev[i] || false,
              curr[i],
              parent,
              i + index
            );
          } else {
            node[i + index].remove();
          }
        }
        return node;
      }
      case Number:
      case String: {
        if (is_html(node)) {
          node.replaceWith(new Text(curr));
          break;
        }
        if (is_text_node(node)) {
          if (node.nodeValue != curr) {
            node.nodeValue = curr;
          }
        } else {
          this.append_at(parent, curr, index);
        }
        break;
      }
      case Boolean: {
        if (is_node(node)) {
          node.remove();
          return null;
        }
      }
    }
  };
  append(element, node) {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const n of node) {
        element.append(n);
      }
    } else {
      element.append(node);
    }
  }
  append_at = (element, children, index) => {
    if (element.childNodes.length > 0) {
      let prev_element;
      while (index > 0) {
        const item = element.childNodes[index - 1];
        if (is_node(item)) {
          prev_element = item;
          break;
        }
        index--;
      }
      prev_element.after(children);
    } else {
      element.append(children);
    }
  };
};
var Element = class {
  tag;
  props = {};
  events = {};
  children;
  constructor(tag, props = {}, children) {
    this.tag = tag;
    this.children = children;
    for (const key in props) {
      if (key.startsWith("on")) {
        this.events[key] = props[key];
      } else {
        this.props[key] = props[key];
      }
    }
  }
};
function is_array(value) {
  return Array.isArray(value);
}
function is_object(value) {
  return value instanceof Object;
}
function is_html(value) {
  if (is_object(value) && value?.nodeType == 1) {
    return value;
  }
}
function is_text_node(value) {
  if (is_object(value) && value?.nodeType == 3) {
    return value;
  }
}
function is_node(value) {
  if (is_object(value) && "nodeType" in value) {
    return value;
  }
}
function is_node_list(value) {
  if (value instanceof NodeList) {
    return true;
  }
}
function is_empty(value) {
  if (typeof value == "number" || typeof value == "string") {
    return false;
  }
  if (is_array(value)) {
    return value.length == 0;
  }
  return value == false || value == null;
}
function log(...m) {
  console.log(...m);
}

// plugin-rce/client/create.ts
var REACTIVE = Symbol("react");
var REF = Symbol("ref");
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
        $$type: REACTIVE
      };
      return this.state_map[index];
    },
    ref(value) {
      const index = this.state_map.length;
      this.state_map[index] = {
        value,
        index,
        $$type: REF
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
    },
    get(getters) {
      const self_ = this;
      const ret2 = getters.map((getter) => {
        if (self_.is_state(getter)) {
          return self_.get_state(getter);
        }
        return getter;
      });
      return ret2;
    },
    set(setters, getters) {
      let index = 0;
      for (const setter of setters) {
        if (this.is_state(setter)) {
          this.set_state(setter, getters[index]);
        }
        index++;
      }
      this.render();
    },
    set_props() {
    },
    [HYDRATE](_) {
      return [];
    },
    init(root) {
      this.template = new Template(this, root);
      return this.template;
    },
    render() {
    }
  };
  const ret = Object.assign((value) => {
    if (Array.isArray(value)) {
      return $.get(value);
    }
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
  window.customElements.define(
    name,
    class extends HTMLElement {
      constructor() {
        super();
        const config = component({});
        const template = config.init(this);
        instances.set(this, { config, template });
      }
      connectedCallback() {
        console.log("mounted");
        const { template } = instances.get(this);
        template.render();
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
function $onMounted(callback) {
  return callback;
}
function $onUnmounted(callback) {
  return callback;
}
function $ref(target) {
  return target;
}
export {
  $onMounted,
  $onUnmounted,
  $ref,
  $state,
  Template,
  create_default as create,
  defineElement_default as defineElement,
  register_default as register
};
