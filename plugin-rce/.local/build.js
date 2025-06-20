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
    curr: [],
    next: []
  };
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
    this.vdom.next = this.$[HYDRATE](this.object);
    for (let i = 0; i < this.vdom.next.length; i++) {
      let next = this.vdom.next[i];
      try {
        if (this.mounted) {
          const curr = this.vdom.curr[i];
          if (typeof next == "string" || typeof next == "number") {
            next = new Text(next);
          }
          this.vdom.next[i] = this.update(curr, next, this.root, i);
        } else {
          this.vdom.next[i] = this.create(next, this.root);
        }
      } catch (err) {
        console.error(err);
      }
    }
    this.mounted = true;
    log(this.vdom);
    this.vdom.curr = this.vdom.next;
  };
  create = (node, parent) => {
    if (node == null) return null;
    switch (node.constructor) {
      case Element: {
        const { tag, props, events, children } = node;
        const element = document.createElement(tag);
        for (const key in props) {
          if (key == "ref") {
            this.$.set_feature(props[key], element);
            console.log(props[key]);
          } else {
            element.setAttribute(key, props[key]);
          }
        }
        for (const key in events) {
          element[key] = events[key];
        }
        for (const child of children) {
          this.create(child, element);
        }
        node.target = element;
        if (parent) {
          parent.append(element);
        }
        return node;
      }
      case String:
      case Number:
      case Text: {
        if (typeof node == "string" || typeof node == "number") {
          node = new Text(node);
        }
        if (parent) parent.append(node);
        return node;
      }
      case Array: {
        return node.map((e) => this.create(e, parent));
      }
      default:
        return null;
    }
  };
  update = (curr, next, parent, index) => {
    if (next) {
      switch (next.constructor) {
        case Element: {
          if (curr == null) {
            this.create(next);
            this.append_at(parent, next.target, index);
            return next;
          }
          if (is_text_node(curr)) {
            this.create(next);
            curr.replaceWith(next.target);
            return next;
          }
          if (is_html(curr.target)) {
            const { props, events, children } = next;
            if (props?.ref) {
              delete props.ref;
            }
            for (const attr of curr.target.attributes) {
              if (attr.name in props) {
                if (attr.value != props[attr.name]) {
                  curr.target.setAttribute(attr.name, props[attr.name]);
                }
              } else {
                curr.target.removeAttribute(attr.name);
              }
            }
            for (const key in events) {
              curr.target[key] = typeof events[key] == "function" ? events[key] : null;
            }
            const curr_children = curr.children;
            for (let i = 0; i < children.length; i++) {
              curr.children[i] = this.update(
                curr_children[i],
                next.children[i],
                curr.target,
                i
              );
            }
            return curr;
          }
          return next;
        }
        case Text: {
          if (curr == null) {
            const text_node = this.create(next);
            this.append_at(parent, text_node, index);
            return text_node;
          }
          if (is_text_node(curr)) {
            if (curr.nodeValue != next.nodeValue) {
              curr.nodeValue = next.nodeValue;
            }
            return curr;
          }
          if (is_html(curr.target)) {
            curr.target.replaceWith(next);
          }
          return next;
        }
        case Array: {
          const max = Math.max(curr.length, next.length);
          for (let i = 0; i < max; i++) {
            next[i] = this.update(
              curr[i] ?? null,
              next[i] ?? null,
              parent,
              i + index
            );
          }
          return next;
        }
        default:
          return next;
      }
    } else {
      if (is_text_node(curr)) {
        curr.remove();
      }
      if (curr?.target) {
        curr.target.remove();
      }
      return null;
    }
  };
  // _update = (
  //   node: HTMLElement | ChildNode | HTMLElement[] | NodeListOf<ChildNode>,
  //   prev: any,
  //   curr: any,
  //   parent: HTMLElement,
  //   index: number
  // ) => {
  //   if (is_empty(curr)) {
  //     if (is_node(node)) {
  //       node.remove()
  //     }
  //     if (is_node_list(node)) {
  //       node[index].remove()
  //       return node
  //     }
  //     return null
  //   }
  //   // console.log('update', node, curr)
  //   switch (curr.constructor) {
  //     case Element: {
  //       if (node == null) {
  //         const res = this.create(curr)
  //         this.append_at(parent, res, index)
  //         return res
  //       }
  //       if (is_text_node(node)) {
  //         node.replaceWith(this.create(curr));
  //         return node
  //       }
  //       if (is_html(node)) {
  //         const { props, events, children } = curr;
  //         for (const attr of node.attributes) {
  //           if (attr.name in props) {
  //             if (attr.value != props[attr.name]) {
  //               node.setAttribute(attr.name, props[attr.name])
  //             }
  //           } else {
  //             node.removeAttribute(attr.name)
  //           }
  //         }
  //         for (const key in events) {
  //           node[key] = typeof events[key] == 'function'
  //             ? events[key]
  //             : null
  //         }
  //         // const max = Math.max(prev.childNodes.length, children.length)
  //         const prev_children = prev.children || [];
  //         let offset = 0
  //         console.table(prev_children, children)
  //         for (let i = 0; i < children.length; i++) {
  //           const prev_children_i = prev_children[i] || false
  //           if (is_empty(prev_children_i) && is_empty(children[i])) {
  //             offset--
  //           } else {
  //             const node_index = i + offset
  //             this.update(
  //               is_array(children[i])
  //                 ? node.childNodes
  //                 : node.childNodes[node_index] ?? null,
  //               prev_children_i,
  //               children[i],
  //               node,
  //               node_index
  //             )
  //             if (is_array(children[i])) {
  //               offset += Math.min(0, children[i].length - 1)
  //             }
  //             if (!prev_children_i && is_empty(children[i])) {
  //               offset -= 1
  //             }
  //           }
  //         }
  //       }
  //       return node;
  //     }
  //     // #region List
  //     case Array: {
  //       // log('-- LIST --')
  //       // log(prev)
  //       // log(curr)
  //       // log('-- LIST END --')
  //       const max = Math.max(prev.length, curr.length)
  //       for (let i = 0; i < max; i++) {
  //         if (i < curr.length) {
  //           this.update(
  //             node[i + index] || null,
  //             prev[i] || false,
  //             curr[i],
  //             parent,
  //             i + index
  //           )
  //         } else {
  //           node[i + index].remove()
  //         }
  //       }
  //       return node
  //     }
  //     case Number:
  //     case String: {
  //       if (is_html(node)) {
  //         node.replaceWith(new Text(curr));
  //         break
  //       }
  //       if (is_text_node(node)) {
  //         if (node.nodeValue != curr) {
  //           node.nodeValue = curr;
  //         }
  //       } else {
  //         this.append_at(parent, curr, index)
  //       }
  //       break
  //     }
  //     case Boolean: {
  //       if (is_node(node)) {
  //         node.remove()
  //         return null
  //       }
  //     }
  //   }
  // }
  append(element, node) {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const e of node) {
        element.append(e.target);
      }
    } else {
      element.append(node.target);
    }
  }
  append_at = (element, children, index) => {
    if (element.childNodes.length > 0) {
      let prev_element;
      while (index > 0) {
        const item = element.childNodes[index];
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
  target;
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
    try {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child == null) continue;
        switch (child.constructor) {
          case String:
          case Number:
            children[i] = new Text(child);
            break;
          case Boolean:
            children[i] = null;
        }
      }
    } catch (err) {
      console.log(err);
      debugger;
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
function log(...m) {
  console.log(...m);
}

// plugin-rce/client/create.ts
var STATE2 = Symbol("state");
var REF = Symbol("ref");
function create(props) {
  const $ = {
    props,
    features: [],
    template: {},
    state(value) {
      const index = this.features.length;
      this.features[index] = {
        value,
        index,
        $$type: STATE2
      };
      return this.features[index];
    },
    ref(value) {
      const index = this.features.length;
      this.features[index] = {
        value,
        index,
        $$type: REF
      };
      return this.features[index];
    },
    get_feature(value) {
      return value.value;
    },
    set_feature(feature, value) {
      this.features[feature.index].value = value;
    },
    is_state(value) {
      if (typeof value == "object" && value?.$$type == STATE2) return true;
      return false;
    },
    is_ref(value) {
      if (typeof value == "object" && value?.$$type == REF) return true;
      return false;
    },
    get(getters) {
      const self = this;
      const ret2 = getters.map((getter) => {
        if (self.is_state(getter) || self.is_ref(getter)) {
          return self.get_feature(getter);
        }
        return getter;
      });
      return ret2;
    },
    set(setters, getters) {
      let index = 0;
      for (const setter of setters) {
        if (this.is_state(setter)) {
          this.set_feature(setter, getters[index]);
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
  const ret = Object.assign((getter) => {
    if (Array.isArray(getter)) {
      return $.get(getter);
    }
    if ($.is_state(getter)) {
      return $.get_feature(getter);
    }
    return getter;
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
        console.log("mounted", this);
        const slots = {};
        for (const child of this.children) {
          if (child.localName == "slot") {
            for (const attr of child.attributes) {
              slots[attr.name] = child.childNodes;
              child.remove();
              break;
            }
          }
        }
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
