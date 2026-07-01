const multer = require("multer");
const path = require("path");

/*
  FIX: size limit 150MB se 500MB kar diya hai, taaki badi codebases
  (multiple services, large asset folders, etc.) bhi upload ho sakein.

  NOTE: agar aap free-tier hosting (Render/Railway free plan, etc.) par
  deploy kar rahe hain, unka apna request body size limit ho sakta hai jo
  isse kam ho (kabhi kabhi 100MB ya kam) — wo hosting provider ki taraf se
  hota hai, isko frontend/backend code se override nahi kiya ja sakta. Local
  development/demo ke liye 500MB bilkul kaam karega.
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".zip") {
      return cb(new Error("Only zipped repository bundles (.zip) are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
