import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:5000 (see vite.config.js)
// In production build, set VITE_API_URL to your deployed backend origin.
const baseURL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL,
  timeout: 120000, // AI routes can be slow (live LLM calls) — generous timeout
});

/* ---------------------------------------------------------------------- */
/*  UPLOAD                                                                */
/* ---------------------------------------------------------------------- */

// POST /api/upload  (multipart, field name MUST be "projectZip")
export function uploadProject(file, onProgress) {
  const formData = new FormData();
  formData.append("projectZip", file);
  return api.post("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });
}

/* ---------------------------------------------------------------------- */
/*  PROJECT LIST / SINGLE                                                 */
/* ---------------------------------------------------------------------- */

// GET /api/projects -> { success, projects: [...] }
export const getAllProjects = () => api.get("/api/projects");

// GET /api/project/:id -> { success, project }
export const getProject = (id) => api.get(`/api/project/${id}`);

export const deleteProject = (id) => api.delete(`/api/projects/${id}`);

/* ---------------------------------------------------------------------- */
/*  DASHBOARD / REPORTS  (all GET /api/<thing>/:id)                       */
/* ---------------------------------------------------------------------- */

export const getDashboard = (id) => api.get(`/api/dashboard/${id}`);
export const getArchitecture = (id) => api.get(`/api/architecture/${id}`);
export const getArchitectureDiagram = (id) => api.get(`/api/architecture-diagram/${id}`);
export const getSecurityReport = (id) => api.get(`/api/security/${id}`);
export const getHealth = (id) => api.get(`/api/health/${id}`);
export const getQuality = (id) => api.get(`/api/quality/${id}`);
export const getTechStack = (id) => api.get(`/api/tech-stack/${id}`);
export const getTechDebt = (id) => api.get(`/api/tech-debt/${id}`);
export const getMissingFeatures = (id) => api.get(`/api/missing-features/${id}`);
export const getDependencies = (id) => api.get(`/api/dependencies/${id}`);
export const getDatabaseSchema = (id) => api.get(`/api/database-schema/${id}`);
export const getExecutionFlow = (id) => api.get(`/api/execution-flow/${id}`);
export const getTimeline = (id) => api.get(`/api/timeline/${id}`);
export const getAutoFixes = (id) => api.get(`/api/auto-fixes/${id}`);
export const getRefactorReport = (id) => api.get(`/api/refactor/${id}`);
export const getResurrectionReport = (id) => api.get(`/api/resurrection/${id}`);
export const getDeployment = (id) => api.get(`/api/deployment/${id}`);
export const getProductionReadiness = (id) => api.get(`/api/production/${id}`);
export const getCostReport = (id) => api.get(`/api/cost/${id}`);
export const getDocs = (id) => api.get(`/api/docs/${id}`);
export const getKnowledgeGraph = (id) => api.get(`/api/graph/${id}`);

/* ---------------------------------------------------------------------- */
/*  AI — README / RECOMMENDATIONS (slow, live LLM calls)                  */
/* ---------------------------------------------------------------------- */

export const generateReadmeAI = (id) => api.get(`/api/readme/${id}`);
export const getRecommendations = (id) => api.get(`/api/recommendations/${id}`);

/* ---------------------------------------------------------------------- */
/*  AI CHAT — POST /api/chat/repo-chat  { sessionId, question }           */
/*  NOTE: sessionId here is actually the Project's MongoDB _id            */
/*  (backend does Project.findById(sessionId) inside chatRoutes.js).      */
/*  This route has NO server-side persistence (no ChatSession save) —     */
/*  history is kept only in frontend state for this session.             */
/* ---------------------------------------------------------------------- */

export const sendChatMessage = (projectId, question) =>
  api.post("/api/chat/repo-chat", { sessionId: projectId, question });

export const getChatHistory = (projectId) => api.get(`/api/chat-history/${projectId}`);

/* ---------------------------------------------------------------------- */
/*  REPOSITORY SEARCH — POST /api/repository-search { projectId, keyword }*/
/* ---------------------------------------------------------------------- */

export const searchRepository = (projectId, keyword) =>
  api.post("/api/repository-search", { projectId, keyword });

/* ---------------------------------------------------------------------- */
/*  COPILOT — natural language -> relevant files + AI explanation         */
/*  POST /api/copilot { projectId, question }                             */
/* ---------------------------------------------------------------------- */

export const askCopilot = (projectId, question) =>
  api.post("/api/copilot", { projectId, question });

/* ---------------------------------------------------------------------- */
/*  FEATURE IMPACT SIMULATOR — POST /api/feature-impact/:id { feature }   */
/* ---------------------------------------------------------------------- */

export const simulateFeatureImpact = (id, feature) =>
  api.post(`/api/feature-impact/${id}`, { feature });

/* ---------------------------------------------------------------------- */
/*  CTO REPORT — GET /api/cto-report/:id (slow, live LLM call)            */
/* ---------------------------------------------------------------------- */

export const getCTOReport = (id) => api.get(`/api/cto-report/${id}`);

export default api;
