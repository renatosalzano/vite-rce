// import { $state } from "rce";

const STATE = Symbol('state');

function createConfig(element_name: string, props: { [key: string]: any }) {
  // const config = {

  //   props,
  //   element_name,
  //   state: [],

  //   is_state(value) {

  //     // console.log('is state', value)

  //     // console.log(config.state, value)

  //     // console.log(config.state.indexOf(value))

  //     return false;
  //   },

  //   methods: new Set<Function>(),
  //   render: (_: Function) => [],
  //   batch: () => ({})
  // }

  // $state.current_component = config;
  // Object.assign($state, { 'current': config });

  const config = {
    element_name,
    props,
    $state: [],
    $state_index: new Map<any, number>(),
    state(value: any) {
      const index = config.$state_index.size;
      config.$state_index.set(value, index);
      config.$state[index] = config.$state_index.get(value);
      console.log(index, value)
      return config.$state[index];
    },
    is_state(value: any) {

      console.log('check', value)
      const index = config.$state_index.get(value);
      if (index) {

        console.log(value, index, 'is_state');
        return true;
      }
      return false;
    }
  };

  return config;
}


export type Config = {
  element_name: string;
  methods: Set<Function>;
  is_state: (value: any) => boolean;
  render: (h: Function) => any;
};



export default createConfig;