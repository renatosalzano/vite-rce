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

// plugin-rce/client/Template.ts
var Template = class {
  $;
  root;
  vdom = [];
  dom = [];
  last_element = null;
  mounted = false;
  constructor($, root) {
    $.render = this.render;
    this.$ = $;
    this.root = root;
  }
  object = (tag, props, ...children) => {
    return new Element(tag, props, children);
  };
  render = () => {
    this.vdom = this.$[HYDRATE](this.object);
    for (let i = 0; i < this.vdom.length; i++) {
      let element = this.vdom[i];
      if (this.mounted) {
        this.dom[i] = this.update(this.dom[i], element, this.root, i);
      } else {
        this.dom[i] = this.create(element);
        this.append(this.root, this.dom[i]);
      }
    }
    this.mounted = true;
  };
  create = (item) => {
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
  update = (prev, curr, parent, index) => {
    switch (curr.constructor) {
      case Element: {
        if (prev == null) {
          const res = this.create(curr);
          this.append_at(parent, res, index);
          return res;
        }
        if (is_text_node(prev)) {
          console.log("replace this", prev, curr);
          prev.replaceWith(this.create(curr));
          return prev;
        }
        if (is_html(prev)) {
          const { props, events, children } = curr;
          for (const attr of prev.attributes) {
            if (attr.name in props) {
              prev.setAttribute(attr.name, props[attr.name]);
            } else {
              prev.removeAttribute(attr.name);
            }
          }
          for (const key in events) {
            prev[key] = typeof events[key] == "function" ? events[key] : null;
          }
          const max = Math.max(prev.childNodes.length - 1, children.length);
          for (let i = 0; i < max; i++) {
            const prev_node = prev.childNodes[i] || null;
            this.update(prev_node, children[i], prev, i);
          }
        }
        return prev;
      }
      case Array: {
        let index_offset = 0;
        if (is_node(prev[0])) {
          for (const child of parent.childNodes) {
            if (child.isSameNode(prev[0])) {
              break;
            }
            index_offset++;
          }
        } else {
          index_offset = parent.childNodes.length;
        }
        const dom_list = prev;
        const max = Math.max(curr.length, dom_list.length);
        for (let i = 0; i < max; i++) {
          if (i < curr.length) {
            prev[i] = this.update(prev[i] || null, curr[i], parent, index_offset + i);
          } else {
            prev[i].remove();
            dom_list.splice(i, 1);
          }
        }
        return prev;
      }
      case Number:
      case String: {
        if (is_html(prev)) {
          console.log("replace text node");
          prev.replaceWith(new Text(curr));
          break;
        }
        if (is_text_node(prev)) {
          if (prev.nodeValue != curr) {
            console.log("update text node", curr);
            prev.nodeValue = curr;
          }
        } else {
          this.append_at(parent, curr, index);
        }
        break;
      }
      case Boolean: {
        if (is_node(prev)) {
          prev.remove();
          return null;
        }
      }
    }
  };
  update_element = (prev, curr, parent) => {
  };
  update_list = (prev, curr) => {
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
        $$type: REACTIVE
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
    [HYDRATE](_) {
      return [];
    },
    // [CONDITIONAL](condition: () => boolean, _if: any, _else?: any) {
    //   return new Conditional(condition, _if, _else, deps);
    // },
    // [LIST](result: Function, deps: Reactive[]) {
    //   return new List(result, deps);
    // },
    init(root) {
      this.template = new Template(this, root);
      return this.template;
    },
    render() {
    }
    // template: (() => {
    //   $.template = new Template($);
    //   return $.template;
    // }) as any,
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
export {
  $state,
  Template,
  create_default as create,
  defineElement_default as defineElement,
  register_default as register
};
