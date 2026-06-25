import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ProjectCtx = createContext(null);

const STORAGE_KEY = "resurrection_ai_active_project";

export function ProjectProvider({ children }) {
  const [activeProjectId, setActiveProjectIdState] = useState(null);
  const [activeProjectName, setActiveProjectNameState] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setActiveProjectIdState(parsed.id || null);
        setActiveProjectNameState(parsed.name || null);
      }
    } catch {
      // ignore
    }
  }, []);

  const setActiveProject = useCallback((id, name) => {
    setActiveProjectIdState(id);
    setActiveProjectNameState(name || null);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const clearActiveProject = useCallback(() => {
    setActiveProjectIdState(null);
    setActiveProjectNameState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ProjectCtx.Provider
      value={{ activeProjectId, activeProjectName, setActiveProject, clearActiveProject }}
    >
      {children}
    </ProjectCtx.Provider>
  );
}

export function useActiveProject() {
  const ctx = useContext(ProjectCtx);
  if (!ctx) throw new Error("useActiveProject must be used inside ProjectProvider");
  return ctx;
}
