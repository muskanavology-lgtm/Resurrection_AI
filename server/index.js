require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const dns = require('node:dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

// Routes Imports
const docPlanRoutes = require("./routes/docPlanRoutes");
const executionFlowRoutes = require("./routes/executionFlowRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const ctoReportRoutes = require("./routes/ctoReportRoutes");
const projectExplorerRoutes = require("./routes/projectExplorerRoutes");
const readmeRoutes = require("./routes/readmeRoutes");
const healthRoutes = require("./routes/healthRoutes");
const codeGeneratorRoutes = require("./routes/codeGeneratorRoutes");
const contextChatRoutes = require("./routes/contextChatRoutes");
const graphRoutes = require("./routes/graphRoutes");
const projectRoutes = require("./routes/projectRoutes");
const repositoryRoutes = require("./routes/repositoryRoutes");
const securityAIRoutes = require("./routes/securityAIRoutes");
const featurePlannerRoutes = require("./routes/featurePlannerRoutes");
const featureImpactRoutes = require("./routes/featureImpactRoutes");
const changePlannerRoutes = require("./routes/changePlannerRoutes");
const chatRoutes = require("./routes/chatRoutes");
const securityRoutes = require("./routes/securityRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");
const explainRoutes = require("./routes/explainRoutes");
const copilotRoutes = require("./routes/copilotRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await connectDB();

  app.use(cors());

  // 🔴 FIX 1: Zip file bodies ke liye payload limits ko 100MB badha diya gaya hai
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));

  // API Route Mappings
  app.use("/api", projectRoutes);
  app.use("/api", repositoryRoutes);
  app.use("/api", projectExplorerRoutes);
  app.use("/api", executionFlowRoutes);
  app.use("/api", recommendationRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api", ctoReportRoutes);
  app.use("/api", securityAIRoutes);
  app.use("/api", featureImpactRoutes);
  app.use("/api", changePlannerRoutes);
  app.use("/api", contextChatRoutes);
  app.use("/api", featurePlannerRoutes);
  app.use("/api", uploadRoutes);
  app.use("/api", explainRoutes);
  app.use("/api", securityRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api", graphRoutes);
  app.use("/api", readmeRoutes);
  app.use("/api", copilotRoutes);
  app.use("/api", codeGeneratorRoutes);
  app.use("/api", healthRoutes);
app.use("/api/docs", docPlanRoutes);
  app.get("/", (req, res) => {
    res.json({ success: true, message: "Project Resurrection AI API Running" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Pro-level analysis server running on port ${PORT}`);
  });

  // 🔴 FIX 2: Engine Keep-Alive aur response buffer stream limits badhayein
  server.timeout = 900000; // 15 Minutes (900,000ms)
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

startServer();