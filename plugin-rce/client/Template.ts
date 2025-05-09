import Cache from "./Cache";
import { Config } from "./createConfig";

type AnyObject = {
  [key: string]: any;
}

type ConditionalTypes = '$if' | '$for';

//#region Template

class Template {

  // mutations = new Mutations();
  $ = {} as Config;

  cache = new Cache(this);

  // cached = new Map<number, (HTMLElement | ConditionalTemplate | ListTemplate)>();
  // element_checked = new Set<number>();

  constructor(config: Config) {
    this.$ = config;
  }

  init = () => {
    this.cache.start();
    this.$.h(this.init_cache);

    this.$.update = this.update;
  }

  update = () => {
    console.log('update', this)
    this.cache.start();
    this.$.h(this.h);
  }

  init_cache = (tag: string, props: AnyObject, ...children: any[]) => {

    switch (tag) {
      case "$if":
        // case "$ternary":
        // console.log(tag, props, children)
        this.cache.set(new ConditionalTemplate(this.$, props as any, children[0]))
        return;
      case "$for":
        this.cache.set(new ListTemplate(this.$, props as any, children[0]))
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

      if (this.$.is_state(child)) {
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

  // #region Hidrate
  h = (tag: string, props: AnyObject, ...children: any[]) => {

    if (tag == this.$.element_name) {
      return children;
    }

    // console.log(this.cache.index, tag)

    if (this.cache.has()) {

      const element = this.cache.get();

      if (is_directive(element)) {

        if (this.$.is_state(props)) {
          props = this.$.get_state(props);
        }

        const result = element.element(props);

        this.cache.next();

        return result;
      }

      if (this.cache.mutations_not_checked()) {
        // console.log('check mutation')
        this.check_mutations(props, children);
      }

      if (this.cache.has_mutations()) {
        this.cache.apply_mutation(this.$, element, props, children);
      }

      this.cache.next();

      return element;

    } else {

      if (is_directive(tag)) {

        const directive = tag == '$for'
          ? new ListTemplate(this.$, props as any, children[0])
          : new ConditionalTemplate(this.$, props as any, children[0]);

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

        element[name] = value;

      } else {
        element.setAttribute(name, value as string);
      }
    }

    for (const child of children) {

      if (this.$.is_state(child)) {
        element.append(this.$.get_state(child));
      } else if (Array.isArray(child)) {
        element.append(...child)
      } else {
        element.append(child)
      }

    }

    this.cache.set(element);

    return element;
  }


  append = (root: HTMLElement) => {
    this.cache.start();
    const elements = this.$.h(this.h) as HTMLElement[];

    for (const element of elements) {
      root.append(element);
    }

  }



}

//#region Conditional

class ConditionalTemplate extends Template {

  type: ConditionalTypes;
  target: HTMLElement | Comment;

  condition: boolean;
  placeholder: Comment;

  render: (h: Function) => any;

  constructor($: Config, condition: boolean, render: any) {
    super($);

    this.render = render;

    this.placeholder = document.createComment('$if');
    this.target = this.placeholder;
    this.condition = condition;

    this.cache.start();

    this.render(this.init_cache);
  }

  element = (condition: boolean) => {

    this.cache.start();

    let result = this.render(this.h);

    if (this.condition != condition) {

      this.condition = condition;

      if (condition) {

        if (Array.isArray(result)) {

          const fragment = new DocumentFragment();
          fragment.append(...result);
          this.target.replaceWith(fragment);
        } else {

          this.target.replaceWith(result);
        }

        this.target = result;
      } else {

        if (Array.isArray(result)) {

          for (const element of result) {
            if (!this.placeholder.isConnected) {
              element.replaceWith(this.placeholder);
            } else {
              element.remove();
            }
          }

        } else {
          this.target.replaceWith(this.placeholder);
        }
        this.target = this.placeholder;
      }
    }

    return this.target;
  }

}

//#endregion
//#region List

type ListRender = (h: Function, item?: any, index?: number, array?: any[]) => HTMLElement;

class ListTemplate extends Template {

  node_list = new Map<number, HTMLElement | Comment>();

  placeholder: Comment;
  render: ListRender;

  fragment: DocumentFragment;
  first_render = true;

  constructor($: Config, array: any[], render: ListRender) {
    super($);

    this.render = render;

    this.placeholder = document.createComment('$for');

    const item = this.$.is_state(array)
      ? this.$.create_state(array[0])
      : array[0]

    this.cache.start();
    this.render(this.init_cache, item, 0, array);

    this.node_list.set(0, this.placeholder);

  }

  element = (array: any[]) => {

    const node_list: (HTMLElement | Comment)[] = [];

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

        node_list.push(last_element)

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

    return node_list;

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

export {
  Template,
  ConditionalTemplate,
  ListTemplate,
}