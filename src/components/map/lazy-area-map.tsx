"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AreaMap = dynamic(() => import("./area-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

type Props = { lat: number; lng: number; color: string };

/** Só baixa o mapa quando ele está prestes a aparecer na tela (economiza dados no celular). */
export function LazyAreaMap(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-testid="area-map"
      className="h-64 overflow-hidden rounded-2xl border border-border bg-muted/50 sm:h-80"
    >
      {visible ? <AreaMap {...props} /> : null}
    </div>
  );
}
