import {
  GET_VALUE,
} from "../constant";
import { Config } from "./createConfig";

import { ListTemplate, Template } from "./Template";

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

  set_list_index = (index: number) => {
    this.list_index = index;
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

  apply_mutation = ($: Config, element: HTMLElement, props: any, child_nodes: any[]) => {

    // console.log('apply mutation', element)
    for (const mutation of this.mutations.get(this.index)) {

      switch (mutation.type) {

        case "text_node": {
          const value = $[GET_VALUE](child_nodes[mutation.node_index]);
          if (element.childNodes[mutation.node_index].textContent != value) {
            element.childNodes[mutation.node_index].textContent = value;
          }
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

export default Cache;