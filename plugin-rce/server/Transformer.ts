import { acorn } from "./ast";

type Mod = { start: number, end?: number, code: string };

class Transformer {

  static instance: Transformer;

  constructor(
    private source: string
  ) {

    if (Transformer.instance) {
      return Transformer.instance;
    }

    Transformer.instance = this;
  }

  private mods: Mod[] = [];

  private sorted_push(mod: Mod) {

    if (this.mods.length == 0) {
      this.mods.push(mod);
      return;
    }

    // const changes = [...this.mods];
    let index = 0;

    for (const { start } of this.mods) {

      // console.log('index current', index)

      if (mod.start == start) {
        index++;
        continue;
      }


      if (mod.start < start) {
        break;
      }

      if (index == this.mods.length - 1) {
        this.mods.push(mod);
        return;
      }

      index++;
    }

    this.mods.splice(index, 0, mod);
  }

  static insert(at: number, code: string) {
    if (at == undefined) return;
    // print('INSERT', at, code)
    if (at < 0) {
      at = at == -1
        ? this.instance.source.length
        : this.instance.source.length - (at - 1)
    }

    this.instance.sorted_push({ start: at, code });
  }

  static replace({ start, end }: { start: number, end: number } | acorn.Node, code: string) {
    this.instance.sorted_push({ start, end, code });
  }

  static wrap({ start, end }: { start: number, end: number } | acorn.Node, code_start: string, code_end: string) {
    this.instance.sorted_push({ start, code: code_start });
    this.instance.sorted_push({ start: end, code: code_end });
  }

  static print_node(node: acorn.Node) {
    console.log(this.instance.source.slice(node.start, node.end))
  }

  static node(node: acorn.Node) {
    return this.instance.source.slice(node.start, node.end)
  }

  static log() {
    console.log(this.instance.mods)
  }

  static index_from(from: number, substring: string) {
    for (let i = from; i < this.instance.source.length - 1; i++) {
      if (this.instance.source[i] == substring[0]) {

        const _substring = this.instance.source.slice(i, i + substring.length);

        if (_substring == substring) {
          return i;
        }
      }
    }
  }

  static slice(start: number, end: number) {
    return this.instance.source.slice(start, end)
  }

  // slice(start: number, end: number) {
  //   return this.source.slice(start, end)
  // }

  static commit() {

    const self = this.instance;

    let last_index = self.mods[0]?.start;
    const output = [this.slice(0, last_index)]

    let index = 0;
    for (const { start, end, code } of self.mods) {

      last_index = (start && end) ? end : start;
      index++;

      output.push(code + this.slice(last_index, self.mods[index]?.start))
    }

    self.source = output.join('')

    // clean instance
    Transformer.instance = undefined;
    return self.source;
  }



}

export default Transformer;