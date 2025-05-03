import { Config } from "./createConfig";
import { $state } from "rce";

function register(element_name: string, component: (props: any) => Config) {

  const instances = new WeakMap<HTMLElement, {
    config: Config,
    template: Template,
  }>();


  window.customElements.define(
    element_name,
    class extends HTMLElement {

      constructor() {
        super();

        const config = component({});
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
    }
  )
}


type AnyObject = {
  [key: string]: any;
}



class Template {

  mutations = new Mutations();
  config = {} as Config;
  index = 0;

  cached = new Map<number, (HTMLElement | Fragment)>();

  constructor(config: Config) {
    this.config = config;
  }

  init = () => {
    this.config.render(this._init);
    this.index = 0;
  }

  _init = (tag: string, props: AnyObject, ...children: any[]) => {

    switch (tag) {
      case "$if":
      case "$ternary":
      case "$for":
        // console.log(tag, props, children)
        this.cache(new Fragment(this.config, tag, props, children[0]))
        return;
    }

    // MUTATIONS

    let node_index = 0;
    for (const child of children) {

      if ($state.isState(child)) {
        this.mutations.set(this.index, { type: 'text_node', node_index })
      }

      node_index++;
    }

    this.index++;

  }

  cache = (element: HTMLElement | Fragment) => {
    this.cached.set(this.index, element);
    this.index++;
  }

  h = (tag: string, props: AnyObject, ...children: any[]) => {

    if (tag == this.config.element_name) {
      return children;
    }

    if (this.cached.has(this.index)) {

      const element = this.cached.get(this.index);

      if (element instanceof Fragment) {
        return;
      }

      if (this.mutations.has(this.index)) {

        console.log(element, 'has mutations', children)

        for (const mutation of this.mutations.get(this.index)) {

          switch (mutation.type) {

            case "text_node": {
              element.childNodes[mutation.node_index].textContent = children[mutation.node_index]
              break;
            }

          }

        }



      }

      this.index++;

    } else {
      // CREATE ELEMENT

      console.log('create', tag, this)
      const element = document.createElement(tag);

      for (const [name, value] of Object.entries(props ?? {})) {

        if (name.startsWith('on') && typeof value == 'function') {

          if (this.config.methods.has(value)) {
            element[name] = (event: any) => { value(event); this.config.render(this.h); this.index = 0; };
          } else {
            element[name] = value;
          }

        } else {
          element.setAttribute(name, value as string);
        }
      }

      for (const child of children) {
        element.append(child)
      }

      this.cache(element);
      return element;
    }
  }

  append = (root: HTMLElement) => {
    const elements = this.config.render(this.h) as HTMLElement[];

    for (const element of elements) {
      root.append(element);
    }

    this.index = 0;

  }

}

type FragmentTypes = '$if' | '$ternary' | '$for';

class Fragment extends Template {

  type: FragmentTypes;
  condition: any;
  render: (h: Function) => any;

  constructor(config: Config, type: FragmentTypes, condition: any, render: (h: Function) => any) {
    super(config);
    this.type = type;
    this.condition = condition;
    this.render = render;

    this.render(this._init);
    this.index = 0;
  }



  // h = (type: string, condition: any, elements: Function) => { }


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
    type: 'method';
    event_name: string;
    method: Function;
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

export default register;