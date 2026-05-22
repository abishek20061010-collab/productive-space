import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Full-viewport section that fades in/out as it enters/leaves the viewport,
 * with smooth scroll-snap behavior on tall screens.
 */
export function FadeSection({ id, className = "", children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio > 0.35),
      { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      data-visible={visible}
      className={`min-h-screen snap-start flex flex-col justify-center transition-all duration-700 ease-out will-change-[opacity,transform] data-[visible=false]:opacity-0 data-[visible=false]:translate-y-6 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 ${className}`}
    >
      {children}
    </section>
  );
}
