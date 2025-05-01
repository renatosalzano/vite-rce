// import { $state } from "@rce"
const stateSymbol = Symbol('state');
import { $state } from 'rce'


function $hook() {
  let bool = $state(false);

  return [bool]

  // return (instance) => {
  // }
}


function Partial() {

}


function Component({ title = 'hello rce' }) {

  let counter = $state(0);
  let { a: A, b, c: ALIAS } = $state({ a: 0, b: 1, c: 2 });
  let [AAA, BBB] = $state(['a', 'b'])
  let array = $state([0, 1, 2, 3])
  let [bool] = $hook()

  function add() {
    console.log('im alive')
    console.log(counter);
    counter += 1;
  }

  function update() {
    console.log(A, b, ALIAS)
  }

  const props = {}

  return (
    <my-component>
      <span {...props}>{counter}</span>
      <button onclick={add}>add</button>
      {counter > 1 && <div>
        <div>
          <div>
            if
          </div>
        </div>
      </div>}
      {array.map((ele) => (<p>{ele}</p>))}
    </my-component>
  )
}

/* 
targets = [0]
this.h({})


*/


const StatelessComponent = (props) => <custom-div>{props.hello && <span>hello</span>}</custom-div>;

const Comp = function (props) { return <custom-span>{props.hello}</custom-span> }




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
