const multer = require("multer");
const path = require("path");

/*
  NAYA FEATURE: documentation-only upload ke liye alag middleware — code zip
  ke jagah txt/md/pdf/docx accept karta hai.
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `doc-${Date.now()}-${file.originalname}`);
  },
});

const ALLOWED_EXTENSIONS = [".txt", ".md", ".pdf", ".docx"];

const uploadDoc = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB is plenty for a documentation file
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(
        new Error(`Only documentation files are allowed: ${ALLOWED_EXTENSIONS.join(", ")}`),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = uploadDoc;
