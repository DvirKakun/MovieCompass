// src/hooks/useInfiniteScroll.ts
import { useEffect, useRef, useState } from "react";

interface UseInfiniteScrollProps {
  fetchFn: () => Promise<void> | void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
}

export function useInfiniteScroll({
  fetchFn,
  hasMore,
  isLoading,
  rootMargin = "600px",
}: UseInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const loadNextPage = async () => {
    if (isFetching || isLoading || !hasMore) return;

    setIsFetching(true);
    try {
      await fetchFn();
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    // Disconnect previous observer
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Temporarily unobserve to prevent multiple calls
          observerRef.current?.unobserve(el);
          loadNextPage().finally(() => {
            // Re-observe after the fetch completes
            observerRef.current?.observe(el);
          });
        }
      },
      { rootMargin }
    );

    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, isFetching]);

  return { sentinelRef, isFetching };
}
