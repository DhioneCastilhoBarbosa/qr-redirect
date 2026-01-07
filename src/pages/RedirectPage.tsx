import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

function isMobileUA() {
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

export default function RedirectPage() {
  const params = useParams();
  const [sp] = useSearchParams();

  const stationId = params.stationId ?? sp.get("stationId") ?? "";
  const chargerBoxId = params.chargerBoxId ?? sp.get("chargerBoxId") ?? "";

  const APP_URL_TEMPLATE =
    import.meta.env.VITE_APP_URL_TEMPLATE ??
    "https://lk-intelbras.use-move.com/station/{stationId}/{chargerBoxId}";

  const WEB_URL_TEMPLATE =
    import.meta.env.VITE_WEB_URL_TEMPLATE ??
    "https://terminal-pagamento.intelbras-cve-pro.com.br/?chargerBoxId={chargerBoxId}";

  const FALLBACK_DELAY_MS = Number(
    import.meta.env.VITE_FALLBACK_DELAY_MS ?? 1500
  );

  const webUrl = useMemo(() => {
    return fillTemplate(WEB_URL_TEMPLATE, { stationId, chargerBoxId });
  }, [WEB_URL_TEMPLATE, stationId, chargerBoxId]);

  const appUrl = useMemo(() => {
    return fillTemplate(APP_URL_TEMPLATE, { stationId, chargerBoxId });
  }, [APP_URL_TEMPLATE, stationId, chargerBoxId]);

  const [status, setStatus] = useState<
    "idle" | "opening-app" | "fallback" | "invalid"
  >("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stationId || !chargerBoxId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("invalid");
      return;
    }

    // Desktop: vai direto pro web
    if (!isMobileUA()) {
      window.location.replace(webUrl);
      return;
    }

    // Mobile: tenta abrir o app e prepara fallback
    setStatus("opening-app");

    // tenta abrir o app
    window.location.href = appUrl;

    // fallback se o app não abrir
    timeoutRef.current = window.setTimeout(() => {
      setStatus("fallback");
      window.location.replace(webUrl);
    }, FALLBACK_DELAY_MS);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [stationId, chargerBoxId, appUrl, webUrl, FALLBACK_DELAY_MS]);

  if (status === "invalid") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>Link inválido</h2>
        <p>Faltou stationId ou chargerBoxId.</p>
        <p>
          Exemplo: <code>/r/956/SEU-UUID</code> ou{" "}
          <code>/q?stationId=956&chargerBoxId=SEU-UUID</code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
      <h2 style={{ margin: "0 0 8px" }}>Redirecionando…</h2>
      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        {status === "opening-app"
          ? "Tentando abrir o aplicativo."
          : "Abrindo o pagamento web."}
      </p>

      <a href={webUrl}>Abrir pagamento web agora</a>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        <div>
          <strong>App:</strong> {appUrl}
        </div>
        <div>
          <strong>Web:</strong> {webUrl}
        </div>
      </div>
    </div>
  );
}
