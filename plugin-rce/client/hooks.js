let hookStates = [];
let hookIndex = 0;

export function $state(initialValue) {
  const currentIndex = hookIndex;

  // Initialize the state if it's the first time this hook is run
  hookStates[currentIndex] = hookStates[currentIndex] || initialValue;

  // Update hook index for the next hook call
  hookIndex++;

  // Function to update state and re-render
  const setState = (newValue) => {
    hookStates[currentIndex] = typeof newValue === 'function'
      ? newValue(hookStates[currentIndex])
      : newValue;
    // Re-render the component how?
  };

  console.log(hookStates, hookIndex)

  return [hookStates[currentIndex], setState];
}