import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

function isMobileUA() {
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

type Status = "idle" | "opening-app" | "fallback" | "invalid";

export default function RedirectPage() {
  const params = useParams();
  const [sp] = useSearchParams();

  // pega de /r/:stationId/:chargerBoxId ou /q?stationId=...&chargerBoxId=...
  const stationId = (params.stationId ?? sp.get("stationId") ?? "").trim();
  const chargerBoxId = (
    params.chargerBoxId ??
    sp.get("chargerBoxId") ??
    ""
  ).trim();

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

  const [status, setStatus] = useState<Status>("idle");

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

    setStatus("opening-app");

    let fallbackTimer: number | null = null;
    const clearFallback = () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    };

    const onVisibilityChange = () => {
      // Se o app abriu, o navegador perde foco/entra em background.
      // Cancelamos o fallback para não empurrar o usuário pro web/store.
      if (document.visibilityState === "hidden") clearFallback();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    // Tenta abrir o app (pode falhar em alguns leitores de QR/webviews)
    window.location.href = appUrl;

    // Fallback só se continuar visível após X ms
    fallbackTimer = window.setTimeout(() => {
      if (document.visibilityState !== "hidden") {
        setStatus("fallback");
        window.location.replace(webUrl);
      }
    }, FALLBACK_DELAY_MS);

    return () => {
      clearFallback();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [stationId, chargerBoxId, appUrl, webUrl, FALLBACK_DELAY_MS]);

  if (status === "invalid") {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>Link inválido</h2>
        <p>Faltou stationId ou chargerBoxId.</p>
        <p>
          Exemplo: <code>/r/956/SEU-UUID</code> ou{" "}
          <code>/q?stationId=956&amp;chargerBoxId=SEU-UUID</code>
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

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* gesto do usuário: aumenta MUITO a chance do SO abrir o app ao invés de mandar pra loja */}
        <button
          onClick={() => (window.location.href = appUrl)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          Abrir no app
        </button>

        <a href={webUrl}>Abrir pagamento web agora</a>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        <div>
          <strong>App:</strong> {appUrl}
        </div>
        <div>
          <strong>Web:</strong> {webUrl}
        </div>
      </div>

      {/* dica rápida para casos de webview (Instagram/Facebook) */}
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Se você estiver abrindo pelo Instagram/Facebook, toque em “Abrir no
        navegador” para o app abrir corretamente.
      </div>
    </div>
  );
}
