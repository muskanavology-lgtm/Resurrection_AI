const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { generateProjectPlan, getProjectPlan } = require("../controllers/docPlanController");
const { generateProjectFiles } = require("../controllers/codeGenController");

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".txt", ".md", ".pdf", ".docx"];
    if (!allowed.includes(ext)) {
      return cb(new Error(`Only ${allowed.join(", ")} files allowed`), false);
    }
    cb(null, true);
  }
});
router.post("/plan", docUpload.single("document"), generateProjectPlan);
router.get("/plan/:id", getProjectPlan);
router.post("/generate/:docPlanId", generateProjectFiles);
module.exports = router;
