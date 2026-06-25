import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import UploadPage from "../pages/UploadPage";
import Architecture from "../pages/Architecture";
import Security from "../pages/Security";
import Health from "../pages/Health";
import Chat from "../pages/Chat";
import RepositorySearch from "../pages/RepositorySearch";
import KnowledgeGraph from "../pages/KnowledgeGraph";
import ImpactSimulator from "../pages/ImpactSimulator";
import ReadmePage from "../pages/ReadmePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/security" element={<Security />} />
      <Route path="/health" element={<Health />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/search" element={<RepositorySearch />} />
      <Route path="/graph" element={<KnowledgeGraph />} />
      <Route path="/impact" element={<ImpactSimulator />} />
      <Route path="/readme" element={<ReadmePage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
