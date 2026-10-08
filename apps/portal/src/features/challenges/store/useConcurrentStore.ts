import { useSyncExternalStore, useRef, useCallback } from 'react';

export type Listener = () => void;

export interface Store<T> {
  getState: () => T;
  setState: (updater: Partial<T> | ((prevState: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
  getSnapshot: () => T;
  getVersion: () => number;
}

export function createStore<T extends Record<string, any>>(initialState: T): Store<T> {
  let state = initialState;
  let version = 0;
  const listeners = new Set<Listener>();
  let isBatching = false;
  let pendingState: Partial<T> = {};

  const getState = () => state;
  const getSnapshot = () => state;
  const getVersion = () => version;

  const notify = () => {
    version++;
    listeners.forEach(listener => listener());
  };

  const setState = (updater: Partial<T> | ((prevState: T) => Partial<T>)) => {
    const partial = typeof updater === 'function' ? updater(state) : updater;
    
    // Microtask batching to consolidate synchronous multi-updates
    if (!isBatching) {
      isBatching = true;
      pendingState = { ...partial };

      queueMicrotask(() => {
        isBatching = false;
        const nextState = { ...state, ...pendingState };
        pendingState = {};

        // Referential identity check
        let hasChanged = false;
        for (const key of Object.keys(nextState)) {
          if (!Object.is(state[key], nextState[key])) {
            hasChanged = true;
            break;
          }
        }

        if (hasChanged) {
          state = nextState;
          notify();
        }
      });
    } else {
      pendingState = { ...pendingState, ...partial };
    }
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    getState,
    setState,
    subscribe,
    getSnapshot,
    getVersion
  };
}

export function useStore<T extends Record<string, any>, S = T>(
  store: Store<T>,
  selector: (state: T) => S = state => state as unknown as S,
  isEqual: (a: S, b: S) => boolean = Object.is
): S {
  const lastSelectedStateRef = useRef<S | undefined>(undefined);
  const lastSnapshotRef = useRef<T | undefined>(undefined);

  const getSelection = useCallback(() => {
    const currentSnapshot = store.getSnapshot();

    if (
      lastSnapshotRef.current !== undefined &&
      lastSelectedStateRef.current !== undefined &&
      Object.is(lastSnapshotRef.current, currentSnapshot)
    ) {
      return lastSelectedStateRef.current;
    }

    const nextSelected = selector(currentSnapshot);

    if (
      lastSelectedStateRef.current !== undefined &&
      isEqual(lastSelectedStateRef.current, nextSelected)
    ) {
      return lastSelectedStateRef.current;
    }

    lastSnapshotRef.current = currentSnapshot;
    lastSelectedStateRef.current = nextSelected;
    return nextSelected;
  }, [store, selector, isEqual]);

  return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}
