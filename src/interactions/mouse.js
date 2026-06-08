export function createMouseTracker() {
  const target = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  function onPointerMove(event) {
    target.x = (event.clientX / window.innerWidth - 0.5) * 2;
    target.y = (event.clientY / window.innerHeight - 0.5) * -2;
  }

  window.addEventListener("pointermove", onPointerMove);

  return {
    target,
    smooth,
    update() {
      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;
      return smooth;
    },
    dispose() {
      window.removeEventListener("pointermove", onPointerMove);
    },
  };
}
