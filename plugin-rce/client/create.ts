import { HYDRATE } from "../constant";
import { Template } from "./Template";

const REACTIVE = Symbol('react');
const REF = Symbol('ref')

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

    ref(value: any) {

      const index = this.state_map.length;

      this.state_map[index] = {
        value,
        index,
        $$type: REF
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

    set(setters: any[], getters: any[]) {
      let index = 0;
      for (const setter of setters) {

        if (this.is_state(setter)) {
          this.set_state(setter, getters[index]);
        }

        index++;
      }

      this.render()

    },

    set_props() {

    },

    [HYDRATE](_: Function) { return [] },

    init(root: HTMLElement) {
      this.template = new Template(this, root);
      return this.template;
    },

    render() { }
  }

  const ret = Object.assign((getter: any, setter?: any) => {

    if (Array.isArray(getter) && Array.isArray(setter)) {
      console.log('set')
      $.set(getter, setter)
      $.render()
      return
    }

    if (Array.isArray(getter)) {
      return $.get(getter);
    }

    if ($.is_state(getter)) {
      return $.get_state(getter);
    }
    return getter;
  }, $)

  return ret;
}


export type Config = ReturnType<typeof create>






export default create;