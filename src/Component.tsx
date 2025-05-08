import { $state } from '@rce';


function $hook() {
  let bool = $state(false);

  function method() {
    console.log('working method')
    bool = !bool
  }

  return {
    bool,
    method
  }

  // return (instance) => {
  // }
}


function Partial() {

}


export const Component = ({ title = 'hello rce' }) => {

  let show = $state(false)
  let array = $state([1, 2, 3])

  // let [bool] = $hook()

  function add() {
    array.push(array.length + 1)
  }

  const minus = () => {
    array.pop()
  }

  function test(i: number) {

    console.log(`u click the number ${i}`)
  }

  function toggle_list() {
    show = !show
  }


  const props = {}

  return (
    <my-component>
      <h2>my component</h2>
      {/* <span {...props}>{counter}</span> */}
      {/* <strong class={'to do'}>counter is {counter} {counter} {counter}</strong> */}
      <div class='flex column'>
        <button onclick={toggle_list}>list: {show ? 'true' : 'false'}</button>
        <button onclick={add}>add</button>
        <button onclick={minus}>minus</button>

      </div>


      {show && array.map((i) => (
        <div>list item - {i}</div>
      ))}
      {/* {nil !== null && (<span>{nil}</span>)} */}
      {/* {nil == null
        ? null
        : ((array || []).map((parent_index, _index, _arr) => (
          <div>
            item - {parent_index}
          </div>
        )))
      } */}

      {/* {array.map((i) => (<div>list item - {i}</div>))} */}
      {/* {counter > 0 && (<div>if condition <div>counter is {other_counter}</div></div>)} */}
      {/* {counter > 0 ? (<span>counter is greater than 0</span>) : (<span>counter is 0</span>)} */}
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


/* const StatelessComponent = (props) => <custom-div>{props.hello && <span>hello</span>}</custom-div>; */

// const Comp = function (props) { return <custom-span>{props.hello}</custom-span> }




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
