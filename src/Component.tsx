import { $state, $for, defineElement } from '@rce';


function $hook() {
  let show = $state(false);

  function toggle() {
    show = !show
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


export const Component = ({ title = 'hello rce' }) => {

  let show = $state(false)
  let array = $state([1, 2, 3])

  let obj = $state({
    nested: {
      list: [1, 2, 3]
    }
  })

  // let $ = $state(true);

  // const { show, toggle } = $hook();

  function add() {
    array.push(array.length + 1)
  }

  const minus = () => {
    array.pop();
    console.log(array)
  }

  function toggle() {
    show = !show;
    console.log('show', show)
  }



  const props = {}

  return (
    <my-component>
      <h2>my component</h2>
      <div class={show ? 'show' : 'hidden'}>
        <button onclick={toggle}>toggle</button>
        <button onclick={add}>add</button>
        <button onclick={minus}>minus</button>
      </div>

      {show
        ? <div>{array.length > 0 ? "full" : "empty"}</div>
        : "hidden"
      }

      {show && (
        <div>{array.length > 0 && "array is greater than 0"}</div>
      )}

      {array.map((i) => (
        <div>item - {i}
          {i == 2 && <div>condition by param</div>}
          {show ? <div>show</div> : 'hidden'}
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