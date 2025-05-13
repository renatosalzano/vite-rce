import { CONDITIONAL, GET_VALUE, HYDRATE, LIST } from "../constant";

const REACTIVE = Symbol('react');

type Reactive = {
  value: any;
  index: number;
  mutations: Function[];
  $$type: Symbol
}

function create(props: { [key: string]: any }) {

  const $ = {
    props,

    state_map: [] as Reactive[],

    state(value: any) {

      const index = $.state_map.length;

      $.state_map[index] = {
        value,
        index,
        mutations: [],
        $$type: REACTIVE
      }

      return $.state_map[index];
    },

    is_state(value: any) {
      if (typeof value == 'object' && value?.$$type == REACTIVE) return true;
      return false;
    },

    get_state(value: any) {
      return value.value;
    },

    set_state(state: any, value: any) {
      $.state_map[state.index].value = value;

      // console.log('update', $.state_map[state.index])

      for (const update of $.state_map[state.index].mutations) {
        update();
      }

    },

    get(...getters: any[]) {

      return getters.map((getter) => {

        if ($.is_state(getter)) {
          return $.get_state(getter)
        }

        return getter;
      })
    },

    set(setters: any[], getters: []) {
      let index = 0;
      for (const setter of setters) {

        if ($.is_state(setter)) {
          $.set_state(setter, getters[index]);
        }

        index++;
      }

    },

    [GET_VALUE](value: any) {
      if ($.is_state(value)) {
        return $.get_state(value);
      }
      return value;
    },

    [HYDRATE]: (_: Function) => { },

    [CONDITIONAL](condition: () => boolean, deps: Reactive[], _if: any, _else?: any) {

      const conditional = new Conditional(condition, _if, _else);

      for (const dep of deps) {
        dep.mutations.push(conditional.update)
      }

      return conditional.create();
    },

    [LIST](result: Function, deps: Reactive[]) {

      const list = new List(result);

      for (const dep of deps) {
        dep.mutations.push(list.update)
      }

      return list.create()

    },

    template: (() => {
      $.template = new Template($);
      return $.template;
    }) as any,


  };

  return $;
}


export type Config = ReturnType<typeof create>


class Template {

  $: Config;
  root: HTMLElement;

  constructor($: Config) {
    this.$ = $;
  }

  mount = (root: HTMLElement) => {

    this.root = root;
    this.$[HYDRATE](this.render)
  }

  render = (tag: string, props: any, ...children: any) => {
    // console.log(tag, props, children)
    if (tag == this.root.localName) {

      this.append(this.root, children);
      return;
    }

    const element = document.createElement(tag);

    if (props) {
      for (const key in props) {

        let value = props[key];

        if (value instanceof Mutation) {
          // value.set_target(el)
          value.set_target('attr', element, key);

          value = value.value
        }


        // console.log(key, value)

        if (key.startsWith('on')) {
          element[key] = value
        } else {
          element.setAttribute(key, value)
        }
      }
    }


    this.append(element, children);

    return element;
  }

  append(element: HTMLElement, children: any[]) {


    let index = 0;
    for (const child of children) {

      if (child instanceof Mutation) {

        child.set_target('node', element, index)

        if (Array.isArray(child.value)) {
          element.append(...child.value);
        } else {
          element.append(child.value);
        }

      } else {
        element.append(child);
      }

      ++index;
    }

  }


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

class Conditional {

  exec_condition: () => boolean;
  condition: boolean;
  slot: Comment;
  current: any;
  target: Comment | HTMLElement;

  index: number | string;

  type: string;

  node = {
    if: null,
    else: null
  }

  constructor(condition: () => boolean, _if: any, _else = null) {

    this.exec_condition = condition;

    this.condition = condition();

    this.slot = new Comment('$')

    const set_target = (type: string, target: HTMLElement, index: number | string) => {
      this.type = type;
      this.target = target;
      this.index = index;
    }

    this.node.if = new Mutation(_if, set_target);
    this.node.else = new Mutation(_else || this.slot, set_target);

  }

  create = () => {
    this.condition = this.exec_condition();

    if (this.condition) {
      return this.node.if
    } else {
      return this.node.else
    }
  }

  update = () => {
    const condition = this.exec_condition();

    if (this.condition != condition) {

      this.condition = condition

      const node = this.condition
        ? this.node.if
        : this.node.else

      if (this.type == 'node') {
        this.target.childNodes[this.index].replaceWith(node.value)
      }

      if (this.type == 'attr') {
        this.target[this.index] = node.value;
      }

    }

  }


}

class List {

  result: Function;
  slot: Comment;
  node_list: any[] = [];

  target: Comment | HTMLElement;
  child_index = 0;

  constructor(result: Function) {
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



export default create;