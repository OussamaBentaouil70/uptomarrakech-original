"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Lang } from "@/lib/types";

/** Public site key (build-time env var). Without it the widget is not rendered (local dev). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

/**
 * Cloudflare Turnstile anti-bot widget. Calls onToken(token) when solved and onToken(null)
 * when the token expires or fails. Call ref.reset() after each submission (tokens are single-use).
 */
export const TurnstileWidget = forwardRef<TurnstileHandle, { lang: Lang; onToken: (token: string | null) => void; action?: string }>(
  function TurnstileWidget({ lang, onToken, action }, ref) {
    const el = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    useEffect(() => {
      onTokenRef.current = onToken;
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        onTokenRef.current(null);
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return;
      let cancelled = false;
      loadScript()
        .then(() => {
          if (cancelled || !el.current || !window.turnstile || widgetId.current) return;
          widgetId.current = window.turnstile.render(el.current, {
            sitekey: TURNSTILE_SITE_KEY,
            action,
            language: lang,
            theme: "light",
            size: "flexible",
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
          });
        })
        .catch(() => onTokenRef.current(null));
      return () => {
        cancelled = true;
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, [lang, action]);

    if (!TURNSTILE_SITE_KEY) return null;
    return <div ref={el} className="min-h-[65px] w-full" />;
  },
);

export const TURNSTILE_TEXT = {
  fr: {
    required: "Veuillez patienter pendant la vérification anti-robot, puis réessayez.",
    failed: "La vérification anti-robot a échoué. Merci de cocher à nouveau la case puis de renvoyer le formulaire.",
  },
  en: {
    required: "Please wait for the anti-bot check to complete, then try again.",
    failed: "The anti-bot check failed. Please tick the box again and resend the form.",
  },
} as const;
