export class Emitter {
  constructor() {
    this.events = {};
  }

  on(type, listener) {
    const listeners = (this.events[type] ??= new Set());
    listeners.add(listener);
  }

  off(type, listener) {
    const listeners = this.events[type];
    listeners?.delete(listener);
  }

  emit(type, payload) {
    const listeners = this.events[type];
    listeners?.forEach((listener) => listener(payload));
  }
}
