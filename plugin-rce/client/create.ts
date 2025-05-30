import { HYDRATE } from "../constant";
import { Template } from "./Template";

const STATE = Symbol('state');
const REF = Symbol('ref')

export type Reactive = {
  value: any;
  index: number;
  $$type: Symbol;
}

function create(props: { [key: string]: any }) {


  const $ = {

    props,

    features: [] as Reactive[],

    template: {} as Template,

    state(value: any) {

      const index = this.features.length;

      this.features[index] = {
        value,
        index,
        $$type: STATE
      }

      return this.features[index];
    },

    ref(value: any) {

      const index = this.features.length;

      this.features[index] = {
        value,
        index,
        $$type: REF
      }

      return this.features[index];

    },

    get_feature(value: any) {
      return value.value;
    },

    set_feature(feature: any, value: any) {
      this.features[feature.index].value = value;
    },

    is_state(value: any) {
      if (typeof value == 'object' && value?.$$type == STATE) return true;
      return false;
    },

    is_ref(value: any) {
      if (typeof value == 'object' && value?.$$type == REF) return true;
      return false;
    },

    get(getters: any[]) {

      const self = this;

      const ret = getters.map((getter) => {

        if (self.is_state(getter) || self.is_ref(getter)) {
          return self.get_feature(getter)
        }

        return getter;
      })

      return ret;
    },

    set(setters: any[], getters: any[]) {

      let index = 0;
      for (const setter of setters) {

        if (this.is_state(setter)) {
          this.set_feature(setter, getters[index]);
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

  const ret = Object.assign((getter: any) => {

    // if (Array.isArray(getter) && Array.isArray(setter)) {
    //   console.log('set')
    //   $.set(getter, setter)
    //   $.render()
    //   return
    // }

    if (Array.isArray(getter)) {
      return $.get(getter);
    }

    if ($.is_state(getter)) {
      return $.get_feature(getter);
    }

    return getter;
  }, $)

  return ret;
}


export type Config = ReturnType<typeof create>






export default create;