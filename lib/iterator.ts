import { useCallback, useEffect, useMemo, useState } from "react";

export function cycleIndex(current: number, length: number, step = 1) {
  if (length <= 0) return 0;
  return ((current + step) % length + length) % length;
}

export function itemAtCycle<T>(items: readonly T[], index: number): T | undefined {
  if (items.length === 0) return undefined;
  return items[cycleIndex(index, items.length)];
}

export function windowAroundIndex<T>(items: readonly T[], activeIndex: number, radius: number) {
  if (items.length === 0) return [];
  const clampedRadius = Math.max(0, Math.floor(radius));
  return Array.from({ length: clampedRadius * 2 + 1 }, (_, offset) => {
    const distance = offset - clampedRadius;
    const index = cycleIndex(activeIndex + distance, items.length);
    return { item: items[index]!, index, distance };
  });
}

export function useIterator<T>({
  items,
  initialIndex = 0,
  autoAdvanceMs,
  enabled = true,
}: {
  items: readonly T[];
  initialIndex?: number;
  autoAdvanceMs?: number;
  enabled?: boolean;
}) {
  const [index, setIndex] = useState(() => cycleIndex(initialIndex, items.length));

  useEffect(() => {
    setIndex((current) => cycleIndex(current, items.length));
  }, [items.length]);

  useEffect(() => {
    if (!enabled || !autoAdvanceMs || items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => cycleIndex(current, items.length, 1));
    }, autoAdvanceMs);
    return () => window.clearInterval(id);
  }, [autoAdvanceMs, enabled, items.length]);

  const goTo = useCallback((nextIndex: number) => {
    setIndex(cycleIndex(nextIndex, items.length));
  }, [items.length]);

  const next = useCallback(() => {
    setIndex((current) => cycleIndex(current, items.length, 1));
  }, [items.length]);

  const previous = useCallback(() => {
    setIndex((current) => cycleIndex(current, items.length, -1));
  }, [items.length]);

  const activeItem = useMemo(() => itemAtCycle(items, index), [items, index]);

  return { index, activeItem, goTo, next, previous };
}
