"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * three.js + @react-three/fiber + drei + gsap + a 621KB GLB is by far the
 * heaviest thing on the homepage, and it lives in a section most visitors
 * never reach. It is split out of the initial bundle entirely and only starts
 * downloading once the section is within 400px of the viewport — on every
 * screen size, phones included. The static image is just the placeholder
 * shown until then.
 */
const HeroCanvas = dynamic(() => import("@/components/bot/HeroCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function DeferredHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative order-1 flex h-full min-h-96 w-full min-w-0 items-center justify-center overflow-hidden md:order-2"
    >
      {inView ? (
        <HeroCanvas />
      ) : (
        <Image
          src="/assets/zerof_bot.png"
          width={320}
          height={320}
          alt=""
          aria-hidden
          loading="lazy"
          sizes="(max-width: 767px) 60vw, 320px"
          className="h-auto w-[min(60vw,320px)] object-contain"
        />
      )}
    </div>
  );
}
