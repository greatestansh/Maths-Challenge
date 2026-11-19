import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { sequence } from '../math/twoadic.mjs';

export const firstTerm = 1;
export const lastTerm = 20;
const SequenceContext = createContext<{
  current: ReturnType<typeof sequence>;
  setTerm: (term: number) => void;
  player: string | null;
  togglePlayback: (source: string) => void;
  pause: (source: string) => void;
} | null>(null);

export function SequenceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ term: number; player: string | null }>({ term: firstTerm, player: null });
  const setTerm = useCallback((term: number) => setState({ term, player: null }), []);
  const togglePlayback = useCallback((source: string) => {
    if (document.hidden) return;
    setState((previous) => previous.term === lastTerm ? previous : {
      ...previous, player: previous.player === source ? null : source,
    });
  }, []);
  const pause = useCallback((source: string) => {
    setState((previous) => previous.player === source ? { ...previous, player: null } : previous);
  }, []);

  useEffect(() => {
    if (!state.player) return;
    const timer = window.setTimeout(() => {
      setState((previous) => {
        if (previous !== state) return previous;
        if (document.hidden) return { ...previous, player: null };
        const term = previous.term + 1;
        return { term, player: term === lastTerm ? null : previous.player };
      });
    }, 750);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setState((previous) => previous.player ? { ...previous, player: null } : previous);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return <SequenceContext.Provider value={{ current: sequence(state.term), setTerm, player: state.player, togglePlayback, pause }}>
    {children}
  </SequenceContext.Provider>;
}

export function useSequence() {
  const state = useContext(SequenceContext);
  if (!state) throw new Error('A SequenceProvider is required.');
  return state;
}
