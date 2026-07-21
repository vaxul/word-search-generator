import { type Dispatch, useReducer } from 'react';
import { type AppAction, type AppState, appReducer, initialState } from './state';

/**
 * The app store hook — a thin `useReducer` wrapper (spec Prior decision: plain
 * React state, no state-management library). Returns the current {@link AppState}
 * and the {@link AppAction} dispatch. The Phase 3 shell reads `state`; the later
 * editor/generate/solution issues import `dispatch` to drive transitions.
 */
export function useAppStore(): {
  state: AppState;
  dispatch: Dispatch<AppAction>;
} {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return { state, dispatch };
}
