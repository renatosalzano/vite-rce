import { $state } from "rce";


function createConfig(element_name: string, props: { [key: string]: any }) {


  const config = {

    props,
    element_name,
    state: [],

    set(value: any, deps: string[]) {

      let index = 0;

      if ($state.isState(value)) {
        index = config.state.push(value) - 1;
      }

      return config.state[index];
    },
    methods: new Set<Function>(),
    render: (_: Function) => [],
    batch: () => ({})
  }

  return config;

}


export type Config = ReturnType<typeof createConfig>;





class _Config {

  element_instance: HTMLElement;

  is_mounted = false;

  state = new Map<string, any>();
  elements: (HTMLElement | Fragment)[] = [];
  element_index = 0;
  element_list = new Map<number, (HTMLElement | Fragment)[]>();

  caching_list = false;

  methods = new Set<Function>();

  mutations = new Mutations();
  skip_element_cache = new Set();

  // $: { [key: string]: unknown }

  constructor(
    public element_name: string
  ) {

    // const self = this;

    // this.$ = new Proxy({}, {
    //   set(t, k, v) {
    //     console.log('update', k, v)
    //     if (self.is_mounted) {
    //       self.update();
    //     }
    //     return Reflect.set(t, k, v);
    //   }
    // })
  }

  props(props) {
    // todo register 
  }

  set(value: any, deps: string[]) {

    if ($state.isState(value)) {
      let index = 0;
      for (const dep of deps) {
        switch (value.constructor) {
          case Object:
            const values = Object.values(value);
            this.state.set(dep, values[index]);
            // this.$[dep] = values[index];
            index++;
            break;
          case Array:
            this.state.set(dep, value[index]);
            // this.$[dep] = value[index];
            index++;
            break;
          default:
            this.state.set(dep, value);
          // this.$[dep] = value;
        }
      }
    }
    return value;
  }

  update_state() {

    // use for optimization???
    // const new_state = this.batch() as { [key: string]: unknown };

    this.update();
  }

  h_directive = () => {

  }

  h = (tag: string, props: any, ...children: any[]) => {

    if (tag == this.element_name) {
      return children;
    }

    if (this.elements[this.element_index] && !this.caching_list) {

      const element = this.elements[this.element_index];

      // console.log('cached', element)

      if (this.mutations.has(this.element_index)) {
        // console.log(element.childNodes)
        for (const mutation of this.mutations.get(this.element_index)) {

          switch (mutation.type) {

            case "text_node": {
              element.childNodes[mutation.node_index].textContent = children[mutation.node_index]
              break;
            }

            case "directive": {

              this.h_directive()

              const fragment = element as Fragment;

              switch (mutation.operator) {

                case "if":
                  if (props != fragment.condition) {

                    const element = props
                      ? fragment.content
                      : fragment.slot;

                    fragment.target.replaceWith(element);
                    fragment.target = element;
                    fragment.condition = props;

                  }
                  break;

                case "for":
                  // console.log('for', tag, props, children)

                  this.element_list.set(this.element_index, []);

                  this.caching_list = true;
                  const elements = props() || [];
                  this.caching_list = false;


                  const max_index = Math.max(elements.length, fragment.list_content.length);

                  // console.log(fragment.list_content)
                  let last_element;

                  for (let i = 0; i < max_index; i++) {

                    if (i < elements.length) {

                      if (fragment.list_content[i]) {

                        if (!fragment.list_content[i].isEqualNode(elements[i])) {
                          fragment.list_content[i].replaceWith(elements[i]);
                          fragment.list_content[i] = elements[i];
                          last_element = elements[i];
                        } else {
                          last_element = fragment.list_content[i];
                        }
                      } else {

                        fragment.list_content[i] = elements[i]
                        last_element.after(elements[i])
                        last_element = elements[i];
                      }

                    } else {

                      if (fragment.list_content.length == 1) {
                        fragment.list_content[i].replaceWith(fragment.placeholder);
                        fragment.list_content[i] = fragment.placeholder;
                      } else {

                        fragment.list_content[i].remove();
                        fragment.list_content.pop();
                      }

                    }
                  }

                  // fragment.list_content = elements;
                  // console.dir(fragment.content)
                  break;

                case "ternary":
                  fragment.target.replaceWith(props);
                  break;
              }
              break;
            }
          }
        }
      }

      this.element_index++;
      // const element = this.elements.get($$component_key);

      // console.log('element cached', element)
      return element;

    } else {

      // console.log('create element', tag, props, children)

      if (tag.startsWith('$')) {

        const fragment = document.createDocumentFragment() as Fragment;

        // console.log(this.elements[this.element_index - 1])
        // this.elements.splice(this.element_index - 1, 1, null);

        switch (tag) {
          case '$if':
            // props as condition
            fragment.content = children[0];
            fragment.slot = document.createElement('slot');
            fragment.target = props ? fragment.content : fragment.slot;
            fragment.condition = props;
            fragment.append(fragment.target);
            break;
          case '$ternary':
            // props as element
            fragment.target = props;
            fragment.append(props);
            break;
          case '$for':
            // props as elements
            // console.log('create for', props, children)

            this.caching_list = true;
            const elements = props() || [];
            this.caching_list = false;

            fragment.list_content = elements;
            fragment.placeholder = document.createComment('for');
            fragment.target = elements[0] || fragment.placeholder;

            for (const element of elements) {
              fragment.append(element);
            }
            break;
        }

        this.cache(fragment);

        return fragment;
      }

      const element = document.createElement(tag);

      for (const [attr, value] of Object.entries(props ?? {})) {

        if (attr.startsWith('on') && typeof value == 'function') {

          if (this.methods.has(value)) {
            element[attr] = (event: any) => { value(event); this.update_state() };
          } else {
            element[attr] = value;
          }

        } else {
          element.setAttribute(attr, value as string);
        }
      }

      for (const child of children) {
        element.append(child)
      }

      this.cache(element)
      return element;
    }


  }


  cache(element: HTMLElement | Fragment) {

    if (this.caching_list) {

      // console.log(this.elements, this.element_index)

      if (this.element_list.has(this.element_index)) {

        this.element_list
          .get(this.element_index)
          .push(element);

      } else {
        this.element_list.set(this.element_index, [element]);
      }

      return;
    }

    if (!this.skip_element_cache.has(this.element_index)) {
      this.elements[this.element_index] = element;
    }

    this.element_index++;

  }



  init = (tag: string, attr: any, ...children: any[]) => {

    // DIRECTIVES

    switch (tag) {
      case '$if':
        this.mutations.set(this.element_index, { type: 'directive', operator: 'if' })
        break;
      case '$ternary':
        this.skip_element_cache.add(this.element_index - 1);
        this.mutations.set(this.element_index, { type: 'directive', operator: 'ternary' })
        break;
      case '$for':
        this.mutations.set(this.element_index, { type: 'directive', operator: 'for' })
        break;
    }

    // TEXT NODES

    let node_index = 0;
    for (const child of children) {

      if ($state.isState(child)) {
        this.mutations.set(this.element_index, { type: 'text_node', node_index })
      }

      node_index++;
    }

    this.element_index++;
  }


  register(component: Function) {

    component({});

    this.render(this.init);
    this.element_index = 0;

    const self = this;



  }

  update() {
    this.element_index = 0;
    this.render(this.h)
  }

  render = (_: Function) => { }
  batch = () => ({})
}


function append(element: HTMLElement, children: any[]) {
  for (const child of children) {
    element.append(child)
  }
}



export default createConfig;