import { useEffect, useRef } from "react";

export function useFetchOnView(fetchFn: () => void, rootMargin = "400px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // if we already fetched, do nothing on re-renders
    if (fetchedRef.current) return;

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fetchedRef.current) {
          fetchedRef.current = true; // mark as done
          fetchFn(); // run only once
          obs.disconnect();
        }
      },
      { rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return ref;
}
