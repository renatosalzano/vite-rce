

import type { Config } from "./create";
import { get_name } from "./register";
import { Template } from "./Template";

function defineElement(component: (props: any) => Config) {

  const name = get_name(component);

  const instances = new WeakMap<HTMLElement, {
    config: Config,
    template: any,
  }>();

  console.log('define', name)

  window.customElements.define(
    name,
    class extends HTMLElement {

      constructor() {
        super();

        const config = component({});
        const template = config.template();

        // console.log(config)

        // const template = new Template(config);

        // template.init();

        instances.set(this, { config, template });

      }

      connectedCallback() {
        console.log('mounted');

        const { template } = instances.get(this);

        template.mount(this)

        // template.append(this);
        // template.append(this);
        // const html = self.render(self.h);
        // console.log(self.elements);
        // console.log(self.element_list)
        // self.is_mounted = true;


        // // console.log(html)

        // append(this, html as any);

      }

      setProps(props: { [key: string]: any }): void {

      }
    }
  )
}



export default defineElement;