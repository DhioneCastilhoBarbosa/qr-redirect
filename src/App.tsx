import { Routes, Route, Navigate } from "react-router-dom";
import RedirectPage from "./pages/RedirectPage";

export default function App() {
  return (
    <Routes>
      {/* /r/:stationId/:chargerBoxId -> tenta abrir app e fallback web */}
      <Route path="/r/:stationId/:chargerBoxId" element={<RedirectPage />} />

      {/* opcional: /q?stationId=...&chargerBoxId=... */}
      <Route path="/q" element={<RedirectPage />} />

      {/* raiz: manda pra um exemplo ou 404 */}
      <Route path="/" element={<Navigate to="/q" replace />} />
      <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
    </Routes>
  );
}
