import { $state } from "@rce";

function Test() {
  let counter = $state(0);

  return (
    <test-component>
      <div>test component</div>
    </test-component>
  )
}

export { Test }