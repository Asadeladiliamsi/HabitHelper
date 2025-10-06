import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// This is a NodeJS event emitter, which is compatible with client-side code.
class TypedEventEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
    this.emitter.emit(event as string, ...args);
  }

  on<K extends keyof T>(event: K, listener: T[K]) {
    this.emitter.on(event as string, listener);
  }

  off<K extends keyof T>(event: K, listener: T[K]) {
    this.emitter.off(event as string, listener);
  }
}

export const errorEmitter = new TypedEventEmitter<AppEvents>();
