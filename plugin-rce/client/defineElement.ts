import { Config } from "./createConfig";

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

        console.log(config)

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


type AnyObject = {
  [key: string]: any;
}

class Template {

  // mutations = new Mutations();
  config = {} as Config;

  cache = new Cache(this);

  // cached = new Map<number, (HTMLElement | ConditionalTemplate | ListTemplate)>();
  // element_checked = new Set<number>();

  constructor(config: Config) {
    this.config = config;
  }

  init = () => {
    this.cache.start();
    this.config.render(this.init_cache);

    console.log(this.cache)

  }

  init_cache = (tag: string, props: AnyObject, ...children: any[]) => {

    switch (tag) {
      case "$if":
      case "$ternary":
        // console.log(tag, props, children)
        this.cache.set(new ConditionalTemplate(this.config, tag, props as any, children[0]))
        return;
      case "$for":
        this.cache.set(new ListTemplate(this.config, props as any, children[0]))
        return;
    }

    this.check_mutations(props, children);
    this.cache.next();
  }

  check_mutations(props: AnyObject, children: any[]) {

    // ATTRIBUTES
    // for (const attr_name in props) {
    //   if (attr_name.startsWith('on')) return;
    //   const attr_value = props[attr_name];
    // }

    // TEXT NODE
    let node_index = 0;
    for (const child of children) {

      if (this.config.is_state(child)) {
        this.cache.mutation({ type: 'text_node', node_index });
      }

      node_index++;
    }

    this.cache.mutations_is_checked();
  }


  // cache = (element: HTMLElement | ConditionalTemplate | ListTemplate) => {
  //   this.cached.set(this.index, element);
  //   this.index++;
  // }

  h = (tag: string, props: AnyObject, ...children: any[]) => {

    if (tag == this.config.element_name) {
      return children;
    }

    // console.log(this.cache.index, tag)

    if (this.cache.has()) {

      const element = this.cache.get();

      if (is_directive(element)) {

        const html = element.element(props);

        this.cache.next();

        return html;
      }

      if (this.cache.mutations_not_checked()) {
        this.check_mutations(props, children);
      }

      if (this.cache.has_mutations()) {
        this.cache.apply_mutation(element, props, children);
      }

      this.cache.next();

      return element;

    } else {

      if (is_directive(tag)) {

        const directive = tag == '$for'
          ? new ListTemplate(this.config, props as any, children[0])
          : new ConditionalTemplate(this.config, tag as ConditionalTypes, props as any, children[0]);

        this.cache.set(directive);

        return directive.element(props as any);
      }

      return this.create_element(tag, props, children);
    }
  }

  create_element = (tag: string, props: AnyObject, children: HTMLElement[]) => {

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

    this.cache.set(element);

    return element;
  }


  append = (root: HTMLElement) => {
    this.cache.start();
    const elements = this.config.render(this.h) as HTMLElement[];

    for (const element of elements) {
      root.append(element);
    }

  }

  rerender = () => {
    this.cache.start();
    this.config.render(this.h);
    console.log('rerender', this.cache)
  }

}

type ConditionalTypes = '$if' | '$ternary' | '$for';

class ConditionalTemplate extends Template {

  target: HTMLElement | Comment;

  condition: boolean;
  placeholder: Comment;
  render: (h: Function) => any;

  constructor(config: Config, type: ConditionalTypes, condition: boolean, render: (h: Function) => any) {
    super(config);
    this.render = render;

    this.placeholder = document.createComment(type);
    this.target = this.placeholder;
    this.condition = condition;

    this.cache.start();
    this.render(this.init_cache);

  }

  element = (condition: boolean) => {

    this.cache.start();
    const node: HTMLElement | Comment = this.render(this.h) || this.placeholder;

    if (!this.target.isConnected) {
      // first render
      this.target.replaceWith(node);
      this.target = node;

      return this.target;
    }

    if ((this.condition != condition)) {
      this.condition = condition;

      this.target.replaceWith(node);
      this.target = node;
    }

    return this.target;
  }

}

type ListRender = (h: Function, item?: any, index?: number, array?: any[]) => HTMLElement;

class ListTemplate extends Template {

  node_list = new Map<number, HTMLElement | Comment>();

  placeholder: Comment;
  render: ListRender;

  first_render = true;

  constructor(config: Config, array: any[], render: ListRender) {
    super(config);

    this.render = render;

    this.placeholder = document.createComment('$for');

    const item = array[0];

    this.cache.start();
    this.render(this.init_cache, item, 0, array);

    this.node_list.set(0, this.placeholder);

  }

  element = (array: any[]) => {

    array.forEach(i => console.log(i))

    const fragment = document.createDocumentFragment();

    const max_index = Math.max(array.length, this.node_list.size);
    let last_element: HTMLElement | Comment = this.node_list.get(0);

    this.cache.start_list();

    for (let index = 0; index < max_index; index++) {

      if (index < array.length) {

        const item = array[index];

        this.cache.start()
        const element = this.render(this.h, item, index, array);

        if (this.node_list.has(index)) {

          const dom_element = this.node_list.get(index);

          if (!dom_element.isEqualNode(element)) {
            // replace element
            dom_element.replaceWith(element);
            this.node_list.set(index, element);

            last_element = element;
          } else {
            // keep element
            last_element = dom_element;
          }

        } else {
          // add element
          this.node_list.set(index, element);
          last_element.after(element);
          last_element = element;
        }


        if (this.first_render) {
          fragment.append(last_element);
        }

      } else {
        // remove element from DOM

        if (this.node_list.size == 1) {

          this.node_list.get(0).replaceWith(this.placeholder);
          this.node_list.set(0, this.placeholder);
        } else {

          this.node_list.get(index).remove();
          this.node_list.delete(index)
        }
      }

      this.cache.next(true);
    } // end for

    if (this.first_render) {
      this.first_render = false;

      if (this.node_list.size == 0) {
        return this.placeholder;
      }

      return fragment;
    }

  }


  update_item() { }

}


class Cache {

  cached = new Map<number, any>();
  mutations = new Mutations();
  mutations_checked = new Set<number>();

  cache_list = false;

  index = 0;
  list_index = 0;

  constructor(instance?: Template) {
    this.cache_list = instance instanceof ListTemplate;
  }

  set = (element: any) => {

    if (this.cache_list) {

      const cached = this.cached_list();

      cached.set(this.index, element);
      this.index++;
      return;
    }

    this.cached.set(this.index, element);
    this.index++;
  }

  next = (list_index = false) => {

    if (list_index) {
      this.list_index++;
    } else {
      this.index++;
    }
  }

  has = () => {

    if (this.cache_list) {

      const cached = this.cached_list();
      return cached.has(this.index)
    }

    return this.cached.has(this.index);
  }

  get = () => {

    if (this.cache_list) {

      const cached = this.cached_list();
      return cached.get(this.index)
    }

    return this.cached.get(this.index);
  }

  start = () => {
    this.index = 0;
  }

  start_list = () => {
    this.list_index = 0;
  }

  cached_list = () => {

    if (!this.cached.has(this.list_index)) {
      this.cached.set(this.list_index, new Map())
    }

    return this.cached.get(this.list_index);
  }

  clear_list = () => {

    if (this.cached.has(this.list_index)) {
      this.cached.delete(this.list_index)
    }
  }

  mutations_is_checked = () => {
    this.mutations_checked.add(this.index);
  }

  mutations_not_checked = () => {
    return !this.mutations_checked.has(this.index);
  }

  has_mutations = () => {
    return this.mutations.has(this.index);
  }

  get_mutations = () => {
    return this.mutations.get(this.index);
  }

  mutation = (mutation: MutationList[number]) => {
    this.mutations.set(this.index, mutation);
  }

  apply_mutation = (element: HTMLElement, props: AnyObject, child_nodes: any[]) => {

    console.log('apply_mutation', element, this.mutations.get(this.index))

    // console.log('apply mutation', element)
    for (const mutation of this.mutations.get(this.index)) {

      switch (mutation.type) {

        case "text_node": {
          element.childNodes[mutation.node_index].textContent = child_nodes[mutation.node_index]
          break;
        }

      }

    }
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

function is_directive(element: any) {

  if (typeof element == 'string') {

    switch (element) {
      case '$if':
      case '$ternary':
      case '$for':
        return true;
    }
  }

  return element instanceof ConditionalTemplate || element instanceof ListTemplate;
}


export default defineElement;