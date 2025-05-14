import { HYDRATE } from "../constant";
import { Config, Reactive } from "./create";

// #region Template
class Template {

  $: Config;
  current: Conditional;
  tree: any;

  constructor($: Config) {
    this.$ = $;
    this.tree = this.$[HYDRATE](this.object);
    console.log(this.tree)
    // this.analyze(tree);
  }



  object = (tag: string, props: any, ...children: any) => {

    return new ObjectElement(tag, props, children)
  }

  mount = (root: HTMLElement) => {

    for (let child of this.tree.children) {

      child = create_element(child);
      root.append(child);
    }
  }





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


}

type MutationSetTarget = (type: string, t: HTMLElement, index: string | number) => void

class Mutation {
  value: any;
  set_target: MutationSetTarget = () => { };

  constructor(value: any, set_target?: MutationSetTarget) {
    this.value = value;
    if (set_target) this.set_target = set_target;

  }
}

// #region Conditional

class Conditional {

  exec_condition: () => boolean;
  condition: boolean;
  slot: Comment;
  current: any;
  target: Comment | HTMLElement;

  index: number | string;

  type: 'node' | 'attr' | 'event';

  node = {
    if: null,
    else: null
  }

  deps: Reactive[];
  unregister: Function[] = [];

  constructor(condition: () => boolean, _if: any, _else = null, deps: Reactive[]) {

    this.exec_condition = condition;
    this.deps = deps;

    this.condition = condition();

    this.slot = new Comment('$')

    this.node.if = _if;
    this.node.else = _else;

    // console.log(this.node)

  }


  mount = () => {

    for (const dep of this.deps) {
      this.unregister.push(dep.register(this.update));
    }

    switch (this.type) {

      case "node": {

        this.target = this.condition
          ? create_element(this.node.if)
          : create_element(this.node.else)

        return this.target;
      }
      case "attr":
      case "event": {
        return this.condition
          ? this.node.if
          : this.node.else
      }
    }


  }

  unmount = () => {

    for (const unregister of this.unregister) {
      unregister()
    }

  }

  update = () => {
    const condition = this.exec_condition();

    console.log('update')
    if (this.condition != condition) {

    }

  }

  set_type = (type: Conditional['type']) => {

    this.type = type;

    if (type == 'node' && this.node.else == null) {
      this.node.else = this.slot
    }

  }


}

class List {

  result: Function;
  slot: Comment;
  node_list: any[] = [];

  target: Comment | HTMLElement;
  child_index = 0;

  constructor(result: Function, deps: Reactive[]) {
    this.result = result;
    this.slot = new Comment('$')

    this.node_list = this.result();

    if (this.node_list.length == 0) {
      this.node_list[0] = this.slot;
    }

  }

  create = () => {
    return new Mutation(this.node_list)
  }

  update = () => {
    const node_list = this.result();

    const max_index = Math.max(node_list.length, this.node_list.length);
    let last_element: HTMLElement | Comment = this.node_list[0];

    for (let index = 0; index < max_index; index++) {

      const element = node_list[index];

      if (index < node_list.length) {

        if (this.node_list[index]) {

          const dom_element = this.node_list[index];

          if (!dom_element.isEqualNode(element)) {
            // replace item
            dom_element.replaceWith(element);
            this.node_list[index] = element;

            last_element = element;
          } else {
            // keep item
            last_element = dom_element;
          }

        } else {
          // add item
          this.node_list[index] = element;
          last_element.after(element);
          last_element = element;
        }

      } else {
        // remove item

        if (this.node_list.length == 1) {
          this.node_list[0].replaceWith(this.slot);
          this.node_list[0] = this.slot;
        } else {
          this.node_list[index].remove();
          this.node_list.splice(index, 1);
        }

      }
    } // end for

    //
  }

  mutation = (target: HTMLElement) => {
    target.append(...this.node_list);
  }

}

// #region ObjectElement

class ObjectElement {

  tag: string;
  props: any;
  children: any[]

  constructor(tag: string, props: any, children: any[]) {

    this.tag = tag;
    this.props = props;
    this.children = children;

    for (const key in (props ?? {})) {

      const value = props[key];

      if (value instanceof Conditional) {

        if (key.startsWith('on')) {
          value.type = 'event';
          console.log('EVENT', value)
        } else {
          value.type = 'attr';
        }
        // directives.push(value)
      }
    }

    for (const child of children) {

      if (child instanceof Conditional) {
        child.set_type('node')

        // directives.push(child)
      }

      if (child instanceof List) {
        // directives.push(child)
      }

    }
  }
}

function create_element(init: any, index = 0) {

  switch (init.constructor) {

    case Comment:
      return init;

    case String:
      return new Text(init);

    case ObjectElement: {

      const { tag, props, children } = init;

      const element = document.createElement(tag);

      for (const key in (props ?? {})) {

        let value = props[key];

        if (value instanceof Conditional) {
          value = value.mount()
        }

        if (key.startsWith('on')) {
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

export {
  Template,
  Conditional,
  List
}