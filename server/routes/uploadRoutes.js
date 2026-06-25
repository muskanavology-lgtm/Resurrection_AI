const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { uploadProject } = require("../controllers/uploadController");

// Upload ZIP File
router.post("/upload", upload.single("projectZip"), uploadProject);

// Test Route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload Route Working"
  });
});

module.exports = router;