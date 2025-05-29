

import type { Config } from "./create";
import { get_name } from "./register";

function defineElement(component: (props: any) => Config) {

  const name = get_name(component);

  const instances = new WeakMap<HTMLElement, {
    config: Config,
    template: any,
  }>();

  // console.log('define', name)

  window.customElements.define(
    name,
    class extends HTMLElement {

      constructor() {
        super();

        const config = component({});
        const template = config.init(this);

        // console.log(config)

        // const template = new Template(config);

        // template.init();

        instances.set(this, { config, template });

      }

      connectedCallback() {
        console.log('mounted', this);

        const slots = {}

        for (const child of this.children) {
          if (child.localName == 'slot') {
            for (const attr of child.attributes) {
              slots[attr.name] = child.childNodes
              child.remove()
              break
            }
          }
        }
        // debugger

        const { template } = instances.get(this);

        template.render()

      }

      setProps(props: { [key: string]: any }): void {

      }
    }
  )
}



export default defineElement;