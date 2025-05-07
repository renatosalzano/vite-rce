import { $state } from 'rce'


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

  let counter = $state(0);
  let other_counter = $state(0);
  let date = $state(new Date());
  let und = $state(undefined);
  let nil = $state(null);
  let { a: ALIAS, b, c } = $state({ a: 1, b: 2, c: "pippo" });
  // let { a: A, b, c: ALIAS } = $state({ a: 0, b: 1, c: 2 });
  // let [AAA, BBB] = $state(['a', 'b'])
  let array = $state([1, 2, 3])

  let { bool, method } = $hook();
  // let [bool] = $hook()

  function add() {

    method()

    array.push(array.length + 1)
    counter += 1;

    console.log('from component', counter)
    // console.log(counter)

    bool = !bool;

    const test = 0;

    // console.log(bool)

    // function test() {
    //   counter;
    // }
  }

  const minus = () => {
    counter -= 1;

    array.pop()

    nil = null;
  }

  function test(i: number) {

    console.log(`u click the number ${i}`)
  }

  function plus() {
    other_counter += 1;

    ALIAS++;
    b++;

    array = array.map((item) => item + 1);
    console.log(array)

    nil = "IS DEFINED"
  }


  const props = {}

  return (
    <my-component>
      <h2>my component</h2>
      {/* <span {...props}>{counter}</span> */}
      <strong class={'to do'}>counter is {counter} {counter} {counter}</strong>
      <button onclick={add}>add</button>
      <button onclick={minus}>minus</button>
      <div>
        <button onclick={plus}>plus</button>
        <div>
          other counter is {other_counter}
        </div>
      </div>
      {nil !== null && (<span>{nil}</span>)}
      {nil == null ? null : <span>not null</span>}
      {/* {counter > 0 && (<div>if condition <div>counter is {other_counter}</div></div>)} */}
      {(array || []).map((parent_index, _index, _arr) => (
        <div>
          item - {parent_index}
        </div>
      ))}
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
