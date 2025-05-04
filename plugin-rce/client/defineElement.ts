import { Config } from "./createConfig";
import { $state } from "rce";

function defineElement(name: string, component: (props: any) => Config) {

  const instances = new WeakMap<HTMLElement, {
    config: Config,
    template: Template,
  }>();


  window.customElements.define(
    name,
    class extends HTMLElement {

      constructor() {
        super();

        const config = component({});
        const template = new Template(config);

        template.init();

        console.log(template)

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


type AnyObject = {
  [key: string]: any;
}



class Template {

  mutations = new Mutations();
  config = {} as Config;
  index = 0;

  cached = new Map<number, (HTMLElement | Fragment)>();
  element_checked = new Set<number>();

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
        this.cache(new Fragment(this.config, tag, props as any, children[0]))
        return;
    }

    this.check_mutations(props, children);
    this.index++;
  }

  check_mutations(props: AnyObject, children: any[]) {

    for (const attr_name in props) {
      if (attr_name.startsWith('on')) return;
      const attr_value = props[attr_name];
      console.log(attr_name, attr_value)
    }

    // TEXT NODE
    let node_index = 0;
    for (const child of children) {

      if ($state.isState(child)) {
        this.mutations.set(this.index, { type: 'text_node', node_index })
      }

      node_index++;
    }

    this.element_checked.add(this.index)

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
        // console.log(props)
        const fragment = element.element(props as any);
        this.index++;

        return fragment;
      }

      if (!this.element_checked.has(this.index)) {
        this.check_mutations(props, children);
      }

      if (this.mutations.has(this.index)) {

        // console.log(element, 'has mutations', children)

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

      return element;

    } else {
      // CREATE ELEMENT

      // console.log('create', tag)
      const element = document.createElement(tag);

      for (const [name, value] of Object.entries(props ?? {})) {

        if (name.startsWith('on') && typeof value == 'function') {

          if (this.config.methods.has(value)) {
            element[name] = (event: any) => { value(event); this.rerender(); };
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

  rerender = () => {
    this.config.render(this.h);
    this.index = 0;
  }

}

type FragmentTypes = '$if' | '$ternary' | '$for';

class Fragment extends Template {

  type: FragmentTypes;
  target: HTMLElement | Comment;

  condition: boolean;
  placeholder: Comment;
  render: (h: Function) => any;

  constructor(config: Config, type: FragmentTypes, condition: boolean, render: (h: Function) => any) {
    super(config);
    this.type = type;
    this.render = render;

    this.placeholder = document.createComment(type);
    this.target = this.placeholder;
    this.condition = condition;

    this.render(this._init);
    this.index = 0;

  }

  element = (condition: boolean) => {

    const node: HTMLElement | Comment = this.render(this.h) || this.placeholder;
    this.index = 0;

    switch (this.type) {
      case "$if":
      case "$ternary": {
        if (this.condition != condition) {
          this.condition = condition;

          this.target.replaceWith(node);
          this.target = node;
        }

        console.log(this.cached)
        break;
      }
      case "$for":
    }


    return this.target;
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

export default defineElement;