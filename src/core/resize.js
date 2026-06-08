export function setupResize({ camera, renderer, composer }) {
  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (composer) {
      composer.setSize(width, height);
      composer.setPixelRatio?.(Math.min(window.devicePixelRatio, 2));
    }
  }

  window.addEventListener("resize", resize);
  resize();

  return () => window.removeEventListener("resize", resize);
}
