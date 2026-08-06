import Decimal from 'break_infinity.js';
global.Decimal = Decimal;
global.window = global.window || {};
global.window.Decimal = Decimal;

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.AudioContext = class {
  createGain() { return { gain: { value: 1 }, connect: () => {} }; }
  createOscillator() { return { type: 'sine', frequency: { value: 440 }, connect: () => {}, start: () => {}, stop: () => {} }; }
  resume() { return Promise.resolve(); }
};
