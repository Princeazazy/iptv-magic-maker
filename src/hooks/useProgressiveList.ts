import { useCallback, useEffect, useMemo, useState } from "react";

export type ProgressiveListOptions = {
  initial?: number;
  step?: number;
  /** When remaining scroll distance is below this, we load more */
  thresholdPx?: number;
  /** When focused index gets within this many items of the end, we load more */
  focusOverscan?: number;
};

export const useProgressiveList = <T,>(
  items: T[],
  options: ProgressiveListOptions = {},
) => {
  const {
    initial = 80,
    step = 80,
    thresholdPx = 600,
    focusOverscan = 10,
  } = options;

  const [visibleCount, setVisibleCount] = useState(() => Math.min(initial, items.length));

  // Reset when the list identity changes (filters/sort/search)
  useEffect(() => {
    setVisibleCount(Math.min(initial, items.length));
  }, [items, initial]);

  const hasMore = visibleCount < items.length;

  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(items.length, c + step));
  }, [items.length, step]);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining < thresholdPx) loadMore();
    },
    [loadMore, thresholdPx],
  );

  const ensureIndexVisible = useCallback(
    (index: number) => {
      if (index >= visibleCount - focusOverscan) {
        setVisibleCount((c) => Math.min(items.length, Math.max(c, index + step)));
      }
    },
    [focusOverscan, items.length, step, visibleCount],
  );

  return {
    visibleItems,
    visibleCount,
    hasMore,
    loadMore,
    onScroll,
    ensureIndexVisible,
    setVisibleCount,
  };
};
