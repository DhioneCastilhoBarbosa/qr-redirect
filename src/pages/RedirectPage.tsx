import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
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

  const openApp = () => {
    setStatus("trying");
    // importante: gesto do usuário (clique) aumenta chance de abrir o app
    window.location.href = appUrl;
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
      <h2 style={{ margin: "0 0 8px" }}>Escolha como continuar</h2>

      <p style={{ margin: "0 0 16px", opacity: 0.8 }}>
        {status === "trying"
          ? "Tentando abrir o app…"
          : "Se estiver em Instagram/Facebook, use “Abrir no navegador” para o app abrir corretamente."}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={openApp}
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
