// Add this to the top of your main page component to debug infinite loops
const originalSetState = React.Component.prototype.setState;
const originalUseState = React.useState;

let renderCount = 0;
let lastRenderTime = Date.now();

// Override useState to track state changes
React.useState = function (initial) {
  const [state, setState] = originalUseState(initial);

  return [
    state,
    function (newState) {
      renderCount++;
      const now = Date.now();

      if (now - lastRenderTime < 10) {
        // If re-rendering very quickly
        console.error(
          `POTENTIAL INFINITE LOOP: useState called ${renderCount} times in ${now - lastRenderTime}ms`,
        );
        console.trace();
      }

      lastRenderTime = now;
      return setState(newState);
    },
  ];
};

// Track useEffect calls
const originalUseEffect = React.useEffect;
React.useEffect = function (effect, deps) {
  console.log("useEffect called with deps:", deps);
  console.trace();
  return originalUseEffect(effect, deps);
};
