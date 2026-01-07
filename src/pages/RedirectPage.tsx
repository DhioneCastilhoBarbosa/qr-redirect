import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

function isInAppBrowser() {
  const ua = navigator.userAgent || "";
  // Heurística: Instagram/Facebook/LinkedIn e afins (webviews comuns)
  return /(Instagram|FBAN|FBAV|FB_IAB|Line|LinkedInApp)/i.test(ua);
}

type Status = "idle" | "invalid" | "trying";

export default function RedirectPage() {
  const params = useParams();
  const [sp] = useSearchParams();

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

  const appUrl = useMemo(
    () => fillTemplate(APP_URL_TEMPLATE, { stationId, chargerBoxId }),
    [APP_URL_TEMPLATE, stationId, chargerBoxId]
  );

  const webUrl = useMemo(
    () => fillTemplate(WEB_URL_TEMPLATE, { stationId, chargerBoxId }),
    [WEB_URL_TEMPLATE, stationId, chargerBoxId]
  );

  const [status, setStatus] = useState<Status>("idle");

  if (!stationId || !chargerBoxId) {
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

  const openInNewTab = (url: string) => {
    setStatus("trying");
    // Alguns webviews respeitam melhor abrir fora/aba nova
    window.open(url, "_blank", "noopener,noreferrer");
  };

  //const looksLikeWebView = isInAppBrowser();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 560 }}>
      <h2 style={{ margin: "0 0 8px" }}>Escolha como continuar</h2>

      <p style={{ margin: "0 0 16px", opacity: 0.85 }}>
        {status === "trying"
          ? "Abrindo…"
          : "Selecione uma das opções abaixo para acessar a estação de recarga."}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* Melhor tentativa: navegação top-level via <a> (não JS) */}
        <a
          href={appUrl}
          onClick={() => setStatus("trying")}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            textDecoration: "none",
          }}
        >
          Abrir no app
        </a>

        {/* Tentativa alternativa: nova aba (às vezes tira do webview) */}
        <button
          type="button"
          onClick={() => openInNewTab(appUrl)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          Abrir no app (nova aba)
        </button>

        <a
          href={webUrl}
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            textDecoration: "none",
          }}
        >
          Pagar na web
        </a>
      </div>

      {/* Dica prática: "Abrir no navegador" */}
      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.75 }}>
        <strong>Dica:</strong> Se você abriu pelo Instagram/Facebook/LinkedIn ou
        leitor de QR “interno”, procure o menu ⋮/… e toque em{" "}
        <em>“Abrir no navegador”</em>. Webview é onde deep link morre e vira
        loja.
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        <div>
          <strong>App link:</strong> {appUrl}
        </div>
        <div>
          <strong>Web:</strong> {webUrl}
        </div>
      </div>
    </div>
  );
}
