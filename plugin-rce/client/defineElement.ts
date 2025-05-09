

import type { Config } from "./createConfig";
import { Template } from "./Template";

function defineElement(name: string, component: (props: any) => Config) {

  const instances = new WeakMap<HTMLElement, {
    config: Config,
    template: Template,
  }>();

  console.log('define', name)

  window.customElements.define(
    name,
    class extends HTMLElement {

      constructor() {
        super();

        const config = component({});

        // console.log(config)

        const template = new Template(config);

        template.init();

        instances.set(this, { config, template });

      }

      connectedCallback() {
        console.log('mounted');

        const { template } = instances.get(this);

        template.append(this);
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