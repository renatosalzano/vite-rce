import { $state, $ref, defineElement } from '@rce';


function $hook(ref) {
  let show = $state(false);

  function toggle() {
    show = !show
    console.log(ref)
  }

  return {
    show,
    toggle
  }

  // return (instance) => {
  // }
}

const $hook2 = () => {

  let test = $state(false);

  return {
    test
  }
}

const $invalid_hook = () => null;


function $delete_me() {

}

// const $hook = ($) => (...props) => {}


const Partial = (props: { list: Array<number> }) => {

  return (
    <ul>
      {props.list.map((i) => (
        <li>item {i}</li>
      ))}
    </ul>
  )
}


function Button({ onclick, children }: { onclick: Function, children?: any }) {

  return (
    <button onclick={onclick}>{children}</button>
  )
}


export const Component = ({ title = 'hello rce' }) => {

  // let show = $state(false)
  const ref = $ref(null)

  let array = $state([1, 2])

  let { show, toggle } = $hook(ref)



  // let $ = $state(true);

  // const { show, toggle } = $hook();

  function add() {
    array.push(array.length + 1)
  }

  const minus = () => {
    array.pop();
    console.log(array)
  }

  const test = () => {
    array.pop();
    console.log(array)
  }

  // function toggle() {
  //   show = !show;
  //   console.log('show', show)
  // }

  const obj = {
    show,
    usless: true
  }

  const props = {
    obj,
    onclick: add,
    test: {
      nested: {
        key: array.lenght
      }
    }
  }

  return (
    <my-component>
      <h2>my component</h2>

      {/* <slot name='subtitle'></slot> */}

      <div class={show ? 'show' : (array.length > 0 ? "greater than 0" : "is 0")}>
        <button ref={ref} onclick={toggle}>toggle</button>
        <button {...props}>add</button>
        <button onclick={minus}>min</button>
        {/* <Button onclick={minus}><strong>minus</strong> {array.length}</Button> */}
        {/* <button onclick={show ? add : minus}>{show ? 'add' : 'minus'}</button>

        <button onclick={show ? add : null}>{show ? 'add' : 'nothing'} {show && 'add something'}</button> */}
      </div>

      {/* <p>
        counter {array.length}
      </p>

      ROOT COUNTER {array.length} */}


      {/* <Partial list={array} /> */}

      {show ? <div>show</div> : null}

      {array.map((i) => (
        <div>level 0 - {i}
          {show ? <div>show</div> : null}
        </div>
      ))
      }

    </my-component>
  )
}

/*
targets = [0]
this.h({})

const add = _id.method(function add() {
    array.push(array.length + 1)
    counter += 1;

    // function test() {
    //   counter;
    // }
  }, ['counter', 'array'])


*/


// const StatelessComponent = (props) => <custom-div>{props.hello && <span>hello</span>}</custom-div>;

// const UglyExpression = function (props) { return <custom-span>{props.hello}</custom-span> }


// function FuncComponent() {

//   return (
//     <custom-div>
//       <div>
//         custom div
//       </div>
//     </custom-div>
//   )
// }

// const ArrowCustom = (props) => <custom-div></custom-div>

/*

const HelloWorld = ({ title = 'hello', number = 1, test = () => null }) => {

  const __

  return {
    state: {
      counter: 1,
      obj: { a: 1, b: 2, c: 3 }
    },
    cache: new Map()
    render(counter, obj) {
      let template '';

      if (this.cache.has(0) && notEqual(this.cache.get(0), counter)) {
        this.cache.set(0, `<div>${counter}<div>`)
      } else {
        template += this.cache.get(0);
      }

      return `<div>${counter}<div>`

    }
  }

}


hydrate() {

  `${counter > 1 && (<h1>hello world</h1>)}
      <h1>hello world</h1>
      <h1>hello world</h1>
      <Partial show />`

}


*/

// function Partial({ show }) {

//   if (show) {
//     return (
//       <div>bla bla bla</div>
//     )
//   }

//   return null;
// }


// const ArrowPartial = () => <div>arrow partial</div>

defineElement(Component);