import { HYDRATE } from "../constant";
import { Config } from "./create";

// #region Template

type AnyNode = Element | Element[] | string | boolean;

class Template {

  $: Config;
  root: HTMLElement;

  vdom = []
  dom = []
  last_element = null

  mounted = false

  constructor($: Config, root: HTMLElement) {

    $.render = this.render;
    this.$ = $;
    this.root = root;


    // console.log(this.root)
  }


  object = (tag: string, props: any, ...children: any) => {
    return new Element(tag, props, children)
  }

  render = () => {

    this.vdom = this.$[HYDRATE](this.object);

    for (
      let i = 0;
      i < this.vdom.length;
      i++
    ) {

      let element = this.vdom[i];
      if (this.mounted) {
        // update
        this.dom[i] = this.update(this.dom[i], element, this.root, i)
      } else {
        // create
        this.dom[i] = this.create(element);
        this.append(this.root, this.dom[i])
      }

    }

    this.mounted = true;
    // console.log(this.vdom, this.dom)
  }


  create = (item: AnyNode) => {

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

  update = (prev: HTMLElement | ChildNode | HTMLElement[] | boolean, curr: any, parent: HTMLElement, index: number) => {

    switch (curr.constructor) {
      case Element: {

        if (prev == null) {
          const res = this.create(curr)
          this.append_at(parent, res, index)

          return res
        }

        if (is_text_node(prev)) {
          console.log('replace this', prev, curr)
          prev.replaceWith(this.create(curr));
          return prev
        }

        if (is_html(prev)) {

          const { props, events, children } = curr;

          for (const attr of prev.attributes) {
            if (attr.name in props) {
              prev.setAttribute(attr.name, props[attr.name])
            } else {
              prev.removeAttribute(attr.name)
            }
          }

          for (const key in events) {

            prev[key] = typeof events[key] == 'function'
              ? events[key]
              : null

          }

          const max = Math.max(prev.childNodes.length - 1, children.length)

          for (let i = 0; i < max; i++) {

            const prev_node = prev.childNodes[i] || null

            this.update(prev_node, children[i], prev, i)
          }

        }

        return prev;
      }
      case Array: {

        let index_offset = 0;

        if (is_node(prev[0])) {

          for (const child of parent.childNodes) {
            if (child.isSameNode(prev[0])) {
              break
            }
            index_offset++
          }

        } else {
          index_offset = parent.childNodes.length
        }

        // console.log('index_offset', index_offset)

        const dom_list = prev as Array<HTMLElement>;

        const max = Math.max(curr.length, dom_list.length);

        for (let i = 0; i < max; i++) {

          if (i < curr.length) {
            prev[i] = this.update(prev[i] || null, curr[i], parent, index_offset + i);
          } else {
            prev[i].remove()
            dom_list.splice(i, 1)
          }
        }

        return prev
      }
      case Number:
      case String: {

        if (is_html(prev)) {
          console.log('replace text node')
          prev.replaceWith(new Text(curr));
          break
        }

        if (is_text_node(prev)) {

          if (prev.nodeValue != curr) {
            console.log('update text node', curr)
            prev.nodeValue = curr;
          }

        } else {
          this.append_at(parent, curr, index)
        }

        break
      }
      case Boolean: {

        if (is_node(prev)) {
          prev.remove()
          return null
        }
      }
    }



  }


  update_element = (prev: any, curr: HTMLElement, parent: HTMLElement) => {

  }


  update_list = (prev: any, curr: any) => {



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

export {
  Template
}