"use client";
import { useEffect, useRef } from "react";

// Cloudflare Turnstile widget. Renders only when a site key is configured, so
// the form works unchanged when the feature is disabled.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const turnstileEnabled = Boolean(SITE_KEY);

export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  useEffect(() => {
    if (!SITE_KEY) return;

    const render = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "error-callback": () => onVerifyRef.current(""),
        "expired-callback": () => onVerifyRef.current(""),
      });
    };

    let poll: ReturnType<typeof setInterval> | undefined;
    if (window.turnstile) {
      render();
    } else {
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll);
          render();
        }
      }, 200);
    }

    return () => {
      if (poll) clearInterval(poll);
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}
