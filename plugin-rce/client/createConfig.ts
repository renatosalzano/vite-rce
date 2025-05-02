import { $state } from "rce";


interface Fragment extends DocumentFragment {
  target: HTMLElement;
  slot: HTMLSlotElement;
  content: HTMLElement;
}


function createConfig<T extends object>(element_name: string) {


  return new class {

    element_name = element_name;
    element_instance: HTMLElement;

    is_mounted = false;

    state = new Map<string, any>();
    elements: (HTMLElement | Fragment)[] = [];
    element_index = 0;

    mutations = new Mutations();
    skip_element_cache = new Set();

    $: { [key: string]: unknown }

    constructor() {
      const self = this;
      this.$ = new Proxy({}, {
        set(t, k, v) {
          console.log('update', k, v)
          if (self.is_mounted) {
            self.update();
          }
          return Reflect.set(t, k, v);
        }
      })
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
              // this.state.set(dep, values[index]);
              this.$[dep] = values[index];
              index++;
              break;
            case Array:
              // this.state.set(dep, value[index]);
              this.$[dep] = value[index];
              index++;
              break;
            default:
              // this.state.set(dep, value);
              this.$[dep] = value;
          }
        }
      }
      return value;
    }


    // batch(state: { [key: string]: any }) {
    //   // console.log(state)

    //   for (const k in state) {
    //     this.state.set(k, state[k]);
    //   }

    //   console.log(this.state)
    //   this.update();
    // }


    h = (tag: string, props: any, ...children: any[]) => {

      if (tag == this.element_name) {
        return children;
      }

      if (this.elements[this.element_index]) {

        const element = this.elements[this.element_index];

        if (this.mutations.has(this.element_index)) {
          // console.log(element.childNodes)
          for (const mutation of this.mutations.get(this.element_index)) {

            switch (mutation.type) {

              case "text_node": {
                element.childNodes[mutation.node_index].textContent = children[mutation.node_index]
                break;
              }

              case "directive": {

                const fragment = element as Fragment;

                switch (mutation.operator) {
                  case "if":
                    // console.log('if', props, fragment.target)
                    if (props && fragment.target.isEqualNode(fragment.slot)) {
                      fragment.target.replaceWith(fragment.content)
                    } else {
                      fragment.target.replaceWith(fragment.slot)
                    }
                    break;
                  case "for":
                    break;
                  case "ternary":
                    (element as Fragment).target.replaceWith(props);
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
              console.log('create if')
              // props as condition
              fragment.content = children[0];
              fragment.slot = document.createElement('slot');
              fragment.target = props ? fragment.content : fragment.slot;
              fragment.append(fragment.target);
              break;
            case '$ternary':
              fragment.target = props;
              fragment.append(props);
              break;
          }

          this.elements[this.element_index] = fragment;
          this.element_index++;

          return fragment;
        }

        const element = document.createElement(tag);

        for (const [attr, value] of Object.entries(props ?? {})) {

          if (attr.startsWith('on')) {
            element[attr] = value;
          } else {
            element.setAttribute(attr, value as string);
          }
        }



        append(element, children);

        if (!this.skip_element_cache.has(this.element_index)) {
          this.elements[this.element_index] = element;
        }

        this.element_index++;

        return element;
      }


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

      window.customElements.define(
        this.element_name,
        class extends HTMLElement {

          constructor() {
            super();
            self.element_instance = this;

            console.log(self.$)
            // self.instance = this;
          }

          connectedCallback() {
            console.log('mounted')
            const html = self.render(self.h);
            self.is_mounted = true;


            // console.log(html)

            append(this, html as any);

          }
        }
      )

    }

    update() {
      this.element_index = 0;
      this.render(this.h)
    }

    render = (_: Function) => { }
  }

}


function append(element: HTMLElement, children: any[]) {
  for (const child of children) {
    element.append(child)
  }
}

type MutationList = (
  {
    type: 'text_node';
    node_index: number;
  }
  | {
    type: 'attribute';
    node_index: number;
  }
  | {
    type: 'directive';
    operator: 'if' | 'for' | 'ternary';
  }
)[]

class Mutations {

  private mutations = new Map<number, MutationList>()

  set(index: number, mutation: MutationList[number]) {

    if (this.mutations.has(index)) {
      this.mutations.get(index).push(mutation)
    } else {
      this.mutations.set(index, [mutation])
    }
  }

  has(index: number) {
    return this.mutations.has(index)
  }

  get(index: number) {
    return this.mutations.get(index)
  }
}

export default createConfig;