import { HYDRATE } from "../constant";
import { Config } from "./create";

// #region Template

type AnyNode = Element | Element[] | string | boolean;

class Template {

  $: Config;
  root: HTMLElement;

  vdom = {
    prev: [],
    curr: []
  }
  dom = []

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

    this.vdom.curr = this.$[HYDRATE](this.object);

    let offset = 0

    for (
      let i = 0;
      i < this.vdom.curr.length;
      i++
    ) {

      const curr = this.vdom.curr[i]

      try {

        if (this.mounted) {
          // update
          const prev = this.vdom.prev[i];

          if (is_empty(prev) && is_empty(curr)) {
            offset--
          } else {

            log(this.dom[i])

            this.dom[i] = this.update(
              this.dom[i],
              prev,
              curr,
              this.root,
              i + offset
            )

            if (is_array(curr)) {
              offset += Math.min(0, curr.length - 1)
            }

            if (!is_empty(prev) && is_empty(curr)) {
              offset--
            }

          }

        } else {
          // create
          this.dom[i] = this.create(curr)
          this.append(this.root, this.dom[i])

          if (is_array(curr)) {
            this.dom[i] = this.root.childNodes
          }
        }

      } catch (err) {
        console.error(err)
      }

    }

    console.log(this.vdom.prev, this.vdom.curr, this.dom)
    this.mounted = true
    this.vdom.prev = this.vdom.curr
  }


  create = (item: AnyNode) => {

    if (item == null) return null

    switch (item.constructor) {
      case Element: {
        const { tag, props, events, children } = item as Element

        const element = document.createElement(tag)

        for (const key in props) {
          element.setAttribute(key, props[key])
        }

        for (const key in events) {
          element[key] = events[key]
        }

        for (const child of children) {
          this.append(element, this.create(child))
        }

        return element
      }
      case Number:
      case String: {
        return item;
      }
      case Array: {
        return (item as any).map(e => this.create(e))
      }
      default:
        return null
    }


  }

  update = (
    node: HTMLElement | ChildNode | HTMLElement[] | NodeListOf<ChildNode>,
    prev: any,
    curr: any,
    parent: HTMLElement,
    index: number
  ) => {

    if (is_empty(curr)) {

      if (is_node(node)) {
        node.remove()
      }

      if (is_node_list(node)) {
        node[index].remove()
        return node
      }

      return null
    }

    // console.log('update', node, curr)
    switch (curr.constructor) {
      case Element: {

        if (node == null) {
          const res = this.create(curr)
          this.append_at(parent, res, index)

          return res
        }

        if (is_text_node(node)) {
          node.replaceWith(this.create(curr));
          return node
        }

        if (is_html(node)) {

          const { props, events, children } = curr;

          for (const attr of node.attributes) {

            if (attr.name in props) {

              if (attr.value != props[attr.name]) {
                node.setAttribute(attr.name, props[attr.name])
              }

            } else {
              node.removeAttribute(attr.name)
            }
          }

          for (const key in events) {

            node[key] = typeof events[key] == 'function'
              ? events[key]
              : null

          }

          // const max = Math.max(prev.childNodes.length, children.length)
          const prev_children = prev.children;
          let offset = 0

          for (let i = 0; i < children.length; i++) {

            if (is_empty(prev_children[i]) && is_empty(children[i])) {
              offset--
            } else {

              const node_index = i + offset

              this.update(
                is_array(children[i])
                  ? node.childNodes
                  : node.childNodes[node_index] ?? null,
                prev_children[i] || false,
                children[i],
                node,
                node_index
              )

              if (is_array(children[i])) {
                offset += Math.min(0, children[i].length - 1)
              }

              if (!is_empty(prev_children[i]) && is_empty(children[i])) {
                offset -= 1
              }

            }

          }

        }

        return node;
      }
      // #region List
      case Array: {

        // log('-- LIST --')

        // log(prev)
        // log(curr)

        // log('-- LIST END --')

        const max = Math.max(prev.length, curr.length)

        for (let i = 0; i < max; i++) {

          if (i < curr.length) {

            this.update(
              node[i + index] || null,
              prev[i] || false,
              curr[i],
              parent,
              i + index
            )

          } else {
            node[i + index].remove()
          }
        }

        return node
      }
      case Number:
      case String: {

        if (is_html(node)) {
          node.replaceWith(new Text(curr));
          break
        }

        if (is_text_node(node)) {

          if (node.nodeValue != curr) {
            node.nodeValue = curr;
          }

        } else {
          this.append_at(parent, curr, index)
        }

        break
      }
      case Boolean: {

        if (is_node(node)) {
          node.remove()
          return null
        }
      }
    }
  }

  append(element: any, node: any) {

    if (node == null) return;

    if (Array.isArray(node)) {
      for (const n of node) {
        element.append(n)
      }
    } else {
      element.append(node)
    }

  }


  append_at = (element: HTMLElement, children: HTMLElement | string, index: number) => {

    if (element.childNodes.length > 0) {
      let prev_element: HTMLElement;

      while (index > 0) {
        const item = element.childNodes[index - 1]

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


// #region ObjectElement

class Element {

  tag: string
  props: any = {}
  events: any = {}
  children: any[]

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