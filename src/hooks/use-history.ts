import { useState, useCallback, useRef, useEffect } from "react";

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryOptions {
  maxHistory?: number;
}

export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {}
) {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // Track if we should record history (disabled during undo/redo)
  const isInternalChange = useRef(false);

  const set = useCallback(
    (newState: T) => {
      if (isInternalChange.current) {
        // Internal change (undo/redo), don't record in history
        setHistory((prev) => ({ ...prev, present: newState }));
        return;
      }

      setHistory((prev) => {
        // Add current state to past
        const newPast = [...prev.past, prev.present];
        
        // Limit history size
        if (newPast.length > maxHistory) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: newState,
          future: [], // Clear future when new action is performed
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;

      isInternalChange.current = true;

      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;

      isInternalChange.current = true;

      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: [],
    });
  }, [history.present]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Reset flag after state update
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
    }
  }, [history.present]);

  return {
    state: history.present,
    set,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    historySize: history.past.length,
  };
}
