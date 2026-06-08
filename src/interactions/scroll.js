export function createScrollTracker() {
  const state = { progress: 0, smoothProgress: 0 };

  function updateProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    state.progress = window.scrollY / maxScroll;
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  return {
    state,
    update() {
      state.smoothProgress += (state.progress - state.smoothProgress) * 0.08;
      return state.smoothProgress;
    },
    dispose() {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    },
  };
}
