import { CONDITIONAL, GET_VALUE, HYDRATE, LIST } from "../constant";
import { Conditional, List, Template } from "./Template";

const REACTIVE = Symbol('react');

export type Reactive = {
  value: any;
  index: number;
  mutations: Function[];
  register(notify: () => void): () => void;
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
        mutations: [],
        $$type: REACTIVE,
        register(notify) {
          const index = this.mutations.push(notify) - 1;
          return () => {
            this.mutations.splice(index, 1);
          }
        }
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

      // console.log('update', $.state_map[state.index])

      for (const update of this.state_map[state.index].mutations) {
        update();
      }

    },

    get(...getters: any[]) {

      return getters.map((getter) => {

        if (this.is_state(getter)) {
          return this.get_state(getter)
        }

        return getter;
      })
    },

    set(setters: any[], getters: []) {
      let index = 0;
      for (const setter of setters) {

        if (this.is_state(setter)) {
          this.set_state(setter, getters[index]);
        }

        index++;
      }

    },

    [GET_VALUE](value: any) {
      if (this.is_state(value)) {
        return this.get_state(value);
      }
      return value;
    },

    [HYDRATE](_: Function) { },

    [CONDITIONAL](condition: () => boolean, deps: Reactive[], _if: any, _else?: any) {

      return new Conditional(condition, _if, _else, deps);
    },

    [LIST](result: Function, deps: Reactive[]) {

      return new List(result, deps);

    },

    init() {
      this.template = new Template(this);
      return this.template;
    },

    register(reactive: Reactive, notify: Function) {
      const index = reactive.mutations.push(notify) - 1;
      return () => {
        reactive.mutations.splice(index, 1);
      }
    }

    // template: (() => {
    //   $.template = new Template($);
    //   return $.template;
    // }) as any,
  }

  const ret = Object.assign((value: any) => {
    if ($.is_state(value)) {
      return $.get_state(value);
    }
    return value;
  }, $)

  return ret;
}


export type Config = ReturnType<typeof create>






export default create;