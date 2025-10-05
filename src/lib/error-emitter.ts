import { EventEmitter } from 'events';

// This is a global event emitter for Firestore permission errors.
export const errorEmitter = new EventEmitter();
