import { HYDRATE } from "../constant";
import { Config } from "./create";

// #region Template

type AnyNode = Element | Element[] | string | boolean | Text;

class Template {

  $: Config;
  root: HTMLElement;

  vdom = {
    curr: [],
    next: []
  }

  partials = new Map<string, Function>()

  mounted = false

  constructor($: Config, root: HTMLElement) {

    $.render = this.render;
    this.$ = $;
    this.root = root;
  }


  object = (tag: string | Function, props: any, ...children: any) => {

    // #region Component Object
    if (typeof tag == 'function') {

      if (!this.partials.has(tag.name)) {
        this.partials.set(tag.name, tag(this.$))
      }

      const h = this.partials.get(tag.name)

      if (children.length > 0) {
        props.children = children
      }

      return h(this.object, Object.freeze(props))
    } else {
      return new Element(tag, props, children)
    }
  }

  render = () => {

    this.vdom.next = this.$[HYDRATE](this.object);

    for (
      let i = 0;
      i < this.vdom.next.length;
      i++
    ) {

      let next = this.vdom.next[i]

      try {

        if (this.mounted) {
          // update
          const curr = this.vdom.curr[i];

          if (typeof next == 'string' || typeof next == 'number') {
            next = new Text(next as any)
          }

          this.vdom.next[i] = this.update(curr, next, this.root, i)

        } else {
          // create

          this.vdom.next[i] = this.create(next, this.root)
        }

      } catch (err) {
        console.error(err)
      }

    }

    this.mounted = true
    log(this.vdom)
    this.vdom.curr = this.vdom.next
  }


  create = (node: AnyNode, parent?: HTMLElement) => {

    if (node == null) return null

    switch (node.constructor) {
      case Element: {
        const { tag, props, events, children } = node as Element

        const element = document.createElement(tag)

        for (const key in props) {

          if (key == 'ref') {
            this.$.set_feature(props[key], element)
            console.log(props[key])
          } else {
            element.setAttribute(key, props[key])
          }

        }

        for (const key in events) {
          element[key] = events[key]
        }

        for (const child of children) {
          this.create(child, element)
        }

        (node as Element).target = element

        if (parent) {
          parent.append(element)
        }

        return node
      }
      case String:
      case Number:
      case Text: {

        if (typeof node == 'string' || typeof node == 'number') {
          node = new Text(node as any)
        }

        if (parent) parent.append(node as any)

        return node
      }
      case Array: {
        return (node as any).map(e => this.create(e, parent))
      }
      default:
        return null
    }


  }

  update = (
    curr: any,
    next: any,
    parent: HTMLElement,
    index: number
  ) => {

    if (next) {

      switch (next.constructor) {
        case Element: {

          if (curr == null) {
            this.create(next)
            this.append_at(parent, next.target, index)
            return next
          }

          if (is_text_node(curr)) {

            this.create(next)
            curr.replaceWith(next.target)
            return next
          }

          if (is_html(curr.target)) {

            const { props, events, children } = next

            if (props?.ref) {

              delete props.ref
            }

            for (const attr of curr.target.attributes) {

              if (attr.name in props) {

                if (attr.value != props[attr.name]) {
                  curr.target.setAttribute(attr.name, props[attr.name])
                }

              } else {
                curr.target.removeAttribute(attr.name)
              }
            }

            for (const key in events) {

              curr.target[key] = typeof events[key] == 'function'
                ? events[key]
                : null

            }

            const curr_children = curr.children

            for (let i = 0; i < children.length; i++) {

              curr.children[i] = this.update(
                curr_children[i],
                next.children[i],
                curr.target,
                i
              )
            }

            return curr

          }

          return next
        }
        case Text: {

          if (curr == null) {
            const text_node = this.create(next)
            this.append_at(parent, text_node, index)
            return text_node
          }

          if (is_text_node(curr)) {

            if (curr.nodeValue != next.nodeValue) {
              curr.nodeValue = next.nodeValue
            }

            return curr
          }

          if (is_html(curr.target)) {
            curr.target.replaceWith(next)
          }

          return next
        }
        case Array: {

          const max = Math.max(curr.length, next.length)

          for (let i = 0; i < max; i++) {

            next[i] = this.update(
              curr[i] ?? null,
              next[i] ?? null,
              parent,
              i + index
            )

          }

          return next
        }
        default:
          return next
      }
    } else {

      if (is_text_node(curr)) {
        curr.remove()
      }

      if (curr?.target) {
        curr.target.remove()
      }

      return null
    }

  }

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

  append(element: HTMLElement, node: Element | Element[] | null) {

    if (node == null) return;

    if (Array.isArray(node)) {
      for (const e of node) {
        element.append(e.target)
      }
    } else {
      element.append(node.target)
    }

  }


  append_at = (element: HTMLElement, children: HTMLElement | string, index: number) => {

    if (element.childNodes.length > 0) {
      let prev_element: HTMLElement;

      while (index > 0) {
        const item = element.childNodes[index]

        if (is_node(item)) {
          prev_element = item
          break
        }

        index--
      }

      prev_element.after(children)

    } else {
      element.append(children)
    }
  }

}


// #region Element

class Element {

  tag: string
  props: any = {}
  events: any = {}
  children: any[]
  target: HTMLElement | Text

  constructor(tag: string, props: any = {}, children: any[]) {

    this.tag = tag;
    this.children = children;

    for (const key in props) {
      if (key.startsWith('on')) {
        this.events[key] = props[key]
      } else {
        this.props[key] = props[key]
      }
    }

    try {

      for (let i = 0; i < children.length; i++) {

        const child = children[i]

        if (child == null) continue

        switch (child.constructor) {
          case String:
          case Number:
            children[i] = new Text(child)
            break
          case Boolean:
            children[i] = null

        }
      }

    } catch (err) {
      console.log(err)
      debugger
    }

  }
}


function is_array(value: any): value is Array<unknown> {
  return Array.isArray(value)
}

function is_object(value: any): value is Object {
  return value instanceof Object
}

function is_html(value: any): value is HTMLElement {
  if (is_object(value) && value?.nodeType == 1) {
    return value;
  }
}

function is_text_node(value: any): value is Text {
  if (is_object(value) && value?.nodeType == 3) {
    return value;
  }
}


function is_node(value: any): value is HTMLElement {
  if (is_object(value) && "nodeType" in value) {
    return value;
  }
}

function is_node_list(value: any): value is NodeList {
  if (value instanceof NodeList) {
    return true;
  }
}

function is_empty(value: any) {

  if (typeof value == 'number' || typeof value == 'string') {
    return false
  }

  if (is_array(value)) {
    return value.length == 0
  }
  return value == false || value == null
}

function log(...m: any) {
  console.log(...m)
}

export {
  Template
}