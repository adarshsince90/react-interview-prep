import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string | number;
}

export interface UseDynamicVirtualizerOptions {
  count: number;
  estimateHeight: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  getItemKey?: (index: number) => string | number;
}

export interface DynamicVirtualizerResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  measureElement: (element: HTMLElement | null, index: number) => void;
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  isScrolling: boolean;
  metrics: {
    measuredCount: number;
    renderedCount: number;
    binarySearchComparisons: number;
    viewportRange: [number, number];
  };
}

export function useDynamicVirtualizer({
  count,
  estimateHeight,
  overscan = 3,
  containerRef,
  getItemKey = index => index
}: UseDynamicVirtualizerOptions): DynamicVirtualizerResult {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(400);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Height cache: maps item index -> measured height
  const measuredHeightsRef = useRef<Map<number, number>>(new Map());
  const [measurementVersion, setMeasurementVersion] = useState(0);

  // ResizeObserver for element nodes
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeMapRef = useRef<Map<number, HTMLElement>>(new Map());

  // 1. Precompute cumulative offsets & total size
  const { offsets, totalSize } = useMemo(() => {
    const listOffsets: number[] = new Array(count);
    let currentOffset = 0;

    for (let i = 0; i < count; i++) {
      listOffsets[i] = currentOffset;
      const height = measuredHeightsRef.current.get(i) ?? estimateHeight;
      currentOffset += height;
    }

    return {
      offsets: listOffsets,
      totalSize: currentOffset
    };
  }, [count, estimateHeight, measurementVersion]);

  // 2. Binary search to find item at given scroll offset in O(log N)
  const findItemIndexAtOffset = useCallback(
    (targetOffset: number): { index: number; comparisons: number } => {
      let low = 0;
      let high = count - 1;
      let comparisons = 0;

      while (low <= high) {
        comparisons++;
        const mid = Math.floor((low + high) / 2);
        const itemStart = offsets[mid];
        const itemSize = measuredHeightsRef.current.get(mid) ?? estimateHeight;
        const itemEnd = itemStart + itemSize;

        if (targetOffset < itemStart) {
          high = mid - 1;
        } else if (targetOffset >= itemEnd) {
          low = mid + 1;
        } else {
          return { index: mid, comparisons };
        }
      }

      return { index: Math.max(0, Math.min(count - 1, low)), comparisons };
    },
    [count, offsets, estimateHeight]
  );

  // 3. Compute active virtual slice with overscan
  const { virtualItems, binarySearchComparisons, viewportRange } = useMemo(() => {
    if (count === 0) {
      return {
        virtualItems: [],
        binarySearchComparisons: 0,
        viewportRange: [0, 0] as [number, number]
      };
    }

    const { index: rawStartIndex, comparisons: startComp } = findItemIndexAtOffset(scrollTop);
    const scrollBottom = scrollTop + viewportHeight;
    const { index: rawEndIndex, comparisons: endComp } = findItemIndexAtOffset(scrollBottom);

    const startIndex = Math.max(0, rawStartIndex - overscan);
    const endIndex = Math.min(count - 1, rawEndIndex + overscan);

    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        start: offsets[i],
        size: measuredHeightsRef.current.get(i) ?? estimateHeight,
        key: getItemKey(i)
      });
    }

    return {
      virtualItems: items,
      binarySearchComparisons: startComp + endComp,
      viewportRange: [startIndex, endIndex] as [number, number]
    };
  }, [count, scrollTop, viewportHeight, overscan, findItemIndexAtOffset, offsets, estimateHeight, getItemKey]);

  // 4. Measure element callback using ResizeObserver
  const measureElement = useCallback(
    (node: HTMLElement | null, index: number) => {
      if (!node) {
        const existingNode = nodeMapRef.current.get(index);
        if (existingNode && observerRef.current) {
          observerRef.current.unobserve(existingNode);
        }
        nodeMapRef.current.delete(index);
        return;
      }

      nodeMapRef.current.set(index, node);

      if (!observerRef.current) {
        observerRef.current = new ResizeObserver(entries => {
          let hasUpdates = false;

          for (const entry of entries) {
            const element = entry.target as HTMLElement;
            const idxAttr = element.getAttribute('data-virtual-index');
            if (idxAttr == null) continue;

            const itemIndex = Number(idxAttr);
            const measuredHeight = Math.round(
              entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height
            );

            if (measuredHeight > 0) {
              const prev = measuredHeightsRef.current.get(itemIndex);
              if (prev !== measuredHeight) {
                measuredHeightsRef.current.set(itemIndex, measuredHeight);
                hasUpdates = true;
              }
            }
          }

          if (hasUpdates) {
            setMeasurementVersion(v => v + 1);
          }
        });
      }

      node.setAttribute('data-virtual-index', String(index));
      observerRef.current.observe(node);

      // Initial synchronous measure fallback
      const initialHeight = Math.round(node.getBoundingClientRect().height);
      if (initialHeight > 0) {
        const prev = measuredHeightsRef.current.get(index);
        if (prev !== initialHeight) {
          measuredHeightsRef.current.set(index, initialHeight);
          setMeasurementVersion(v => v + 1);
        }
      }
    },
    []
  );

  // 5. Scroll container event listener with RAF throttling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);

      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollTop(container.scrollTop);
      });
    };

    const handleResize = () => {
      setViewportHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafId != null) cancelAnimationFrame(rafId);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [containerRef]);

  // 6. Scroll To Index with auto / start / center / end alignment
  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' | 'auto' = 'auto') => {
      const container = containerRef.current;
      if (!container || index < 0 || index >= count) return;

      const itemStart = offsets[index];
      const itemSize = measuredHeightsRef.current.get(index) ?? estimateHeight;
      const currentScrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;

      let targetScrollTop = itemStart;

      if (align === 'start') {
        targetScrollTop = itemStart;
      } else if (align === 'end') {
        targetScrollTop = itemStart - clientHeight + itemSize;
      } else if (align === 'center') {
        targetScrollTop = itemStart - clientHeight / 2 + itemSize / 2;
      } else {
        // 'auto': only scroll if outside active viewport
        if (itemStart < currentScrollTop) {
          targetScrollTop = itemStart;
        } else if (itemStart + itemSize > currentScrollTop + clientHeight) {
          targetScrollTop = itemStart - clientHeight + itemSize;
        } else {
          return; // Already visible!
        }
      }

      container.scrollTo({
        top: Math.max(0, Math.min(totalSize - clientHeight, targetScrollTop)),
        behavior: 'smooth'
      });
    },
    [count, offsets, estimateHeight, totalSize, containerRef]
  );

  return {
    virtualItems,
    totalSize,
    measureElement,
    scrollToIndex,
    isScrolling,
    metrics: {
      measuredCount: measuredHeightsRef.current.size,
      renderedCount: virtualItems.length,
      binarySearchComparisons,
      viewportRange
    }
  };
}
