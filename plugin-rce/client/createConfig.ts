import { $state } from "rce";

function createConfig<T extends object>(element_name: string) {


  return new class {

    element_name = element_name;
    element_instance: HTMLElement;

    is_mounted = false;

    state: { [key: string]: unknown };
    elements: HTMLElement[] = [];
    element_index = 0;

    events = new Map<HTMLElement, Function>();

    constructor() {

      const self = this;

      this.state = new Proxy({}, {
        set(state, key, value) {
          if (state[key] && self.is_mounted) {
            self.update();
            console.log('update', key, value)
          }
          return Reflect.set(state, key, value);
        }
      })
    }

    props(props) { }

    set(value: any, deps: string[]) {

      if ($state.isState(value)) {
        let index = 0;
        for (const dep of deps) {
          switch (value.constructor) {
            case Object:
              const values = Object.values(value);
              this.state[dep] = values[index];
              index++;
              break;
            case Array:
              this.state[dep] = value[index];
              index++;
              break;
            default:
              this.state[dep] = value;
          }
        }
      }
      return value;
    }


    batch(...values: any[]) {

    }


    createElement = (tag: string, props: any, ...children: any[]) => {

      if (this.elements[this.element_index]) {

        const element = this.elements[this.element_index];
        this.element_index++;
        // const element = this.elements.get($$component_key);

        console.log('element cached', element)

      } else {

        console.log('create element', tag)

        const element = document.createElement(tag);

        for (const [attr, value] of Object.entries(props ?? {})) {

          if (attr.startsWith('on')) {
            element[attr] = value;
          } else {
            element.setAttribute(attr, value as string);
          }
        }

        if (tag == this.element_name) {
          return children;
        }

        append(element, children);

        this.elements[this.element_index] = element;
        this.element_index++;

        return element;
      }


    }

    register(component: Function) {

      return;
      const self = this;

      window.customElements.define(
        element_name,
        class extends HTMLElement {

          constructor() {
            super();
            self.element_instance = this;

            console.log(self.state)
            // self.instance = this;
          }

          connectedCallback() {
            console.log('mounted')
            const html = self.render(self.createElement);
            self.is_mounted = true;


            console.log(html)

            append(this, html as any);

          }
        }
      )

    }

    update() {
      this.element_index = 0;
      this.render(this.createElement)
    }

    render(h: Function) { }
  }

}


function append(element: HTMLElement, children: any[]) {
  for (const child of children) {
    element.append(child)
  }
}

export default createConfig;