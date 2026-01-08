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
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        margin: 0,
        padding: "20px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "40px 32px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "40px"
          }}>
            ⚠️
          </div>
          
          <h2 style={{
            color: "#1f2937",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 16px",
            lineHeight: "1.2"
          }}>
            Link Inválido
          </h2>
          
          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            margin: "0 0 28px",
            lineHeight: "1.6"
          }}>
            Parece que alguns parâmetros necessários estão faltando no seu link. Verifique se você copiou o link completo.
          </p>
          
          <div style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{
              color: "#374151",
              fontSize: "16px",
              fontWeight: "600",
              margin: "0 0 12px"
            }}>
              Formato esperado:
            </h3>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              <div style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "8px",
                margin: "8px 0",
                border: "1px solid #e5e7eb",
                fontFamily: "monospace",
                fontSize: "13px"
              }}>
                /r/956/SEU-UUID
              </div>
              <div style={{ margin: "8px 0", color: "#9ca3af" }}>ou</div>
              <div style={{
                background: "#fff",
                padding: "10px",
                borderRadius: "8px",
                margin: "8px 0",
                border: "1px solid #e5e7eb",
                fontFamily: "monospace",
                fontSize: "13px"
              }}>
                /?stationId=956&chargerBoxId=SEU-UUID
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "#eff6ff",
            borderRadius: "12px",
            border: "1px solid #dbeafe"
          }}>
            <p style={{
              color: "#1e40af",
              fontSize: "14px",
              margin: 0,
              fontWeight: "500"
            }}>
              💡 Entre em contato com quem compartilhou este link para obter a URL correta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      margin: 0,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px 32px",
        maxWidth: "560px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "32px"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#ddd6fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "40px"
          }}>
            🔗
          </div>
          
          <h2 style={{
            color: "#1f2937",
            fontSize: "28px",
            fontWeight: "700",
            margin: "0 0 12px",
            lineHeight: "1.2"
          }}>
            Escolha como continuar
          </h2>

          <p style={{
            color: "#6b7280",
            fontSize: "16px",
            margin: 0,
            lineHeight: "1.6"
          }}>
            {status === "trying"
              ? "Abrindo..."
              : "Selecione uma das opções abaixo para acessar a estação de recarga."}
          </p>
        </div>

        <div style={{ 
          display: "flex", 
          gap: "16px", 
          flexDirection: "column",
          marginBottom: "32px"
        }}>
          <a
            href={appUrl}
            onClick={() => setStatus("trying")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.2s ease",
              border: "none",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}
          >
            📱 Abrir no aplicativo
          </a>

          <a
            href={webUrl}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 24px",
              borderRadius: "12px",
              background: "white",
              color: "#374151",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "16px",
              border: "2px solid #e5e7eb",
              transition: "all 0.2s ease"
            }}
          >
            🌐 Pagar na web
          </a>
        </div>

        <div style={{
          background: "#f0f9ff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #bae6fd",
          marginBottom: "24px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px"
          }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <div>
              <strong style={{ color: "#0369a1", fontSize: "14px" }}>Dica:</strong>
              <p style={{
                color: "#0369a1",
                fontSize: "14px",
                margin: "4px 0 0",
                lineHeight: "1.5"
              }}>
                Se você abriu pelo Instagram/Facebook/LinkedIn ou leitor de QR "interno", 
                procure o menu ⋮/… e toque em <em>"Abrir no navegador"</em>. 
                Isso garante melhor funcionamento dos links.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          background: "#f9fafb",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.6" }}>
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#374151" }}>App:</strong> {appUrl}
            </div>
            <div>
              <strong style={{ color: "#374151" }}>Web:</strong> {webUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
