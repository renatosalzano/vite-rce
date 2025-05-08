import { CREATE_REACTIVE_VALUE, GET_VALUE } from "../constant";

const REACTIVE = Symbol('react');

function createConfig(element_name: string, props: { [key: string]: any }) {


  const $ = {
    element_name,
    props,

    state_map: [],

    state(value: any) {

      const index = $.state_map.length;

      $.state_map[index] = {
        value,
        index,
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
    },

    create_state(value: any) {

      return {
        value,
        $$type: REACTIVE
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

      // console.log('new state', $.state_map)
    },

    [GET_VALUE](value: any) {
      if ($.is_state(value)) {
        return $.get_state(value);
      }
      return value;
    },

    [CREATE_REACTIVE_VALUE](value: any) {
      return {
        value,
        $$type: REACTIVE
      }
    }
  };

  return $;
}


export type Config = ReturnType<typeof createConfig> & {
  methods: Set<Function>,
  render: (h: Function) => any;
}



export default createConfig;