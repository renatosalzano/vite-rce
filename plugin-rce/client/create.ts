import { HYDRATE } from "../constant";
import { Template } from "./Template";

const REACTIVE = Symbol('react');

export type Reactive = {
  value: any;
  index: number;
  $$type: Symbol;
}

function create(props: { [key: string]: any }) {


  const $ = {

    props,

    state_map: [] as Reactive[],

    template: {} as Template,

    state(value: any) {

      const index = this.state_map.length;

      this.state_map[index] = {
        value,
        index,
        $$type: REACTIVE
      }

      return this.state_map[index];
    },

    is_state(value: any) {
      if (typeof value == 'object' && value?.$$type == REACTIVE) return true;
      return false;
    },

    get_state(value: any) {
      return value.value;
    },

    set_state(state: any, value: any) {
      this.state_map[state.index].value = value;

    },

    get(getters: any[]) {

      const self_ = this;

      const ret = getters.map((getter) => {

        if (self_.is_state(getter)) {
          return self_.get_state(getter)
        }

        return getter;
      })

      return ret;
    },

    set(setters: any[], getters: []) {
      let index = 0;
      for (const setter of setters) {

        if (this.is_state(setter)) {
          this.set_state(setter, getters[index]);
        }

        index++;
      }

      this.render()

    },

    [HYDRATE](_: Function) { return [] },

    // [CONDITIONAL](condition: () => boolean, _if: any, _else?: any) {

    //   return new Conditional(condition, _if, _else, deps);
    // },

    // [LIST](result: Function, deps: Reactive[]) {

    //   return new List(result, deps);

    // },

    init(root: HTMLElement) {
      this.template = new Template(this, root);
      return this.template;
    },

    render() { }

    // template: (() => {
    //   $.template = new Template($);
    //   return $.template;
    // }) as any,
  }

  const ret = Object.assign((value: any) => {

    if (Array.isArray(value)) {
      return $.get(value);
    }

    if ($.is_state(value)) {
      return $.get_state(value);
    }
    return value;
  }, $)

  return ret;
}


export type Config = ReturnType<typeof create>






export default create;