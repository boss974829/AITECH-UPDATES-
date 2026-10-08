/** Apple News–style rails: drag and sideways swipes move cards; a vertical scroll keeps moving the page. */
export function bindCasualRail(el: HTMLElement) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pending = false;
  let dragging = false;
  let startX = 0;
  let startLeft = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let pointerId = -1;
  let frame = 0;

  const stopGlide = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const glide = (speed: number) => {
    if (reduced) return;
    let v = speed;
    const step = () => {
      if (Math.abs(v) < 0.35) {
        frame = 0;
        return;
      }
      el.scrollLeft += v;
      v *= 0.92;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  const onWheel = (event: WheelEvent) => {
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    const sideways = event.shiftKey || Math.abs(dx) > Math.abs(dy);
    if (sideways) {
      event.preventDefault();
      stopGlide();
      el.scrollLeft += event.shiftKey ? dy || dx : dx;
      return;
    }
    event.preventDefault();
    window.scrollBy({ top: dy, left: 0, behavior: "auto" });
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button, input, textarea, label")) return;
    el.classList.remove("suppress-click");
    stopGlide();
    pending = true;
    dragging = false;
    startX = event.clientX;
    startLeft = el.scrollLeft;
    lastX = event.clientX;
    lastT = performance.now();
    velocity = 0;
    pointerId = event.pointerId;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pending || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < 6) return;
      dragging = true;
      el.classList.add("is-dragging");
      el.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const now = performance.now();
    const dt = Math.max(16, now - lastT);
    velocity = ((event.clientX - lastX) / dt) * 16;
    lastX = event.clientX;
    lastT = now;
    el.scrollLeft = startLeft - dx;
  };

  const endDrag = (event: PointerEvent) => {
    if (!pending || event.pointerId !== pointerId) return;
    pending = false;
    if (!dragging) return;
    dragging = false;
    el.classList.remove("is-dragging");
    el.classList.add("suppress-click");
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    glide(-velocity);
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!el.classList.contains("suppress-click")) return;
    el.classList.remove("suppress-click");
    event.preventDefault();
    event.stopPropagation();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const dir = event.key === "ArrowRight" ? 1 : -1;
    el.scrollBy({ left: dir * Math.min(420, el.clientWidth * 0.82), behavior: reduced ? "auto" : "smooth" });
  };

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  el.addEventListener("keydown", onKey);
  el.addEventListener("click", onClickCapture, true);
  el.tabIndex = el.tabIndex < 0 ? 0 : el.tabIndex;

  return () => {
    stopGlide();
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", endDrag);
    el.removeEventListener("pointercancel", endDrag);
    el.removeEventListener("keydown", onKey);
    el.removeEventListener("click", onClickCapture, true);
  };
}
