import { describe, it, expect, vi } from 'vitest';
import { createGameEngine } from '../src/engine/createEngine.js';

describe('createGameEngine', () => {
  it('initializes with state and provides getStateUnsafe', () => {
    const initialState = { resources: { energy: 10 } };
    const engine = createGameEngine({ initialState, commandHandlers: {} });
    expect(engine.getStateUnsafe()).toBe(initialState);
  });

  it('handles commands and notifies state and event subscribers precisely once', () => {
    const initialState = { count: 0 };
    const commandHandlers = {
      INCREMENT: (state, cmd) => {
        state.count += cmd.payload || 1;
        return { ok: true, changed: true, events: [{ type: 'COUNT_INCREASED', newCount: state.count }] };
      }
    };
    const engine = createGameEngine({ initialState, commandHandlers });
    
    const stateSub = vi.fn();
    const eventSub = vi.fn();
    
    engine.subscribeState(stateSub);
    engine.subscribeEvents(eventSub);

    const result = engine.dispatch({ type: 'INCREMENT', payload: 2 });
    
    expect(result.ok).toBe(true);
    expect(engine.getStateUnsafe().count).toBe(2);
    expect(stateSub).toHaveBeenCalledTimes(1);
    expect(stateSub).toHaveBeenCalledWith(engine.getStateUnsafe());
    expect(eventSub).toHaveBeenCalledTimes(1);
    expect(eventSub).toHaveBeenCalledWith({ type: 'COUNT_INCREASED', newCount: 2 });
  });

  it('rejects unknown commands without mutating', () => {
    const initialState = { count: 0 };
    const engine = createGameEngine({ initialState, commandHandlers: {} });
    
    const result = engine.dispatch({ type: 'UNKNOWN' });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe('UNKNOWN_COMMAND');
  });

  it('runs systems during tick and accumulates events', () => {
    const initialState = { time: 0 };
    const sys1 = (state, dt) => {
      state.time += dt;
      return { changed: true, events: [{ type: 'TICK_SYS1' }] };
    };
    
    const engine = createGameEngine({ initialState, commandHandlers: {}, systems: [sys1] });
    
    const eventSub = vi.fn();
    engine.subscribeEvents(eventSub);
    
    engine.tick(0.5);
    expect(engine.getStateUnsafe().time).toBe(0.5);
    expect(engine.getStateUnsafe().runtime.simulationTime).toBe(0.5); // automatically injected
    expect(eventSub).toHaveBeenCalledTimes(1);
    expect(eventSub).toHaveBeenCalledWith({ type: 'TICK_SYS1' });
  });
});
