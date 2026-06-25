import { BrowserRouter } from "react-router-dom";
import { ProjectProvider } from "./lib/ProjectContext";
import DashboardLayout from "./layouts/DashboardLayout";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <DashboardLayout>
          <AppRoutes />
        </DashboardLayout>
      </ProjectProvider>
    </BrowserRouter>
  );
}
