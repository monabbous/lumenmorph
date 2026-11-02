import test from "node:test";
import assert from "node:assert/strict";
import { trackPointer } from "../js/pointer.mjs";

function fixture() {
  const view = new EventTarget();
  const motion = new EventTarget();
  motion.matches = false;
  view.matchMedia = () => motion;
  const frames = new Map();
  let next = 0;
  view.requestAnimationFrame = callback => { frames.set(++next, callback); return next; };
  view.cancelAnimationFrame = id => frames.delete(id);
  const target = new EventTarget();
  const values = new Map();
  const priorities = new Map();
  const writes = [];
  target.style = {
    getPropertyValue: key => values.get(key) ?? "",
    getPropertyPriority: key => priorities.get(key) ?? "",
    setProperty(key, value, priority = "") { writes.push(key); values.set(key, value); priorities.set(key, priority); },
    removeProperty: key => values.delete(key),
  };
  target.ownerDocument = Object.assign(new EventTarget(), { defaultView: view, documentElement: new EventTarget() });
  target.getBoundingClientRect = () => ({ left: 100, top: 50 });
  target.clientLeft = 1;
  target.clientTop = 1;
  const move = (x, y, pointerType = "mouse", source = view) => source.dispatchEvent(Object.assign(new Event("pointermove"), { clientX: x, clientY: y, pointerType }));
  const tick = () => { for (const [id, callback] of [...frames]) { frames.delete(id); callback(); } };
  return { view, motion, target, values, priorities, writes, frames, move, tick };
}

test("coalesces moves into one frame and runs no idle loop", () => {
  const f = fixture();
  const stop = trackPointer(f.target);
  f.move(1, 2); f.move(30, 40); f.move(50, 60);
  assert.equal(f.frames.size, 1);
  f.tick();
  assert.equal(f.values.get("--lumen-x"), "50px");
  assert.equal(f.values.get("--lumen-y"), "60px");
  assert.equal(f.writes.length, 2);
  assert.equal(f.frames.size, 0);
  stop();
});

test("ignores touch by default and respects changes to reduced motion", () => {
  const f = fixture();
  const stop = trackPointer(f.target);
  f.move(1, 2, "touch"); assert.equal(f.frames.size, 0);
  f.move(1, 2); f.tick();
  f.motion.matches = true; f.motion.dispatchEvent(new Event("change"));
  assert.equal(f.values.size, 0);
  f.move(1, 2); assert.equal(f.frames.size, 0);
  f.motion.matches = false; f.move(5, 6); f.tick();
  assert.equal(f.values.get("--lumen-y"), "6px");
  stop();
});

test("local coordinates and cleanup restore original inline values and priorities", () => {
  const f = fixture();
  f.target.style.setProperty("--lumen-x", "10px", "important");
  const stop = trackPointer(f.target, { local: true, touch: true });
  f.move(130, 90, "touch", f.target); f.tick();
  assert.equal(f.values.get("--lumen-x"), "29px");
  assert.equal(f.values.get("--lumen-y"), "39px");
  assert.equal(f.values.get("--lumen-attachment"), "scroll");
  f.move(150, 100, "mouse", f.target);
  stop(); stop();
  assert.equal(f.frames.size, 0);
  assert.equal(f.values.size, 1);
  assert.equal(f.values.get("--lumen-x"), "10px");
  assert.equal(f.priorities.get("--lumen-x"), "important");
  f.move(200, 200, "mouse", f.target); assert.equal(f.frames.size, 0);
});

test("pointer exit restores the static light and cancels queued writes", () => {
  const f = fixture();
  const stop = trackPointer(f.target);
  f.move(10, 20);
  f.target.ownerDocument.documentElement.dispatchEvent(new Event("pointerleave"));
  f.tick(); assert.equal(f.values.size, 0);
  stop();
});
