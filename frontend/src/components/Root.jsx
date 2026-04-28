import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CookieConsentBanner } from "./CookieConsentBanner";

export function Root() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll("main section, main .reveal-item")
    );

    if (!targets.length) return;

    targets.forEach((element, index) => {
      element.classList.add("reveal-init");
      element.style.setProperty("--reveal-delay", `${Math.min(index * 24, 140)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-screen app-surface">
      <Navbar />

      <main key={location.pathname} className="route-transition min-h-[60vh]">
        <Outlet />
      </main>

      <Footer />
      <CookieConsentBanner />
    </div>
  );
}
