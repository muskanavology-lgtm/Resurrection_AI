const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure ye folder project root me manually bana ho
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 150 * 1024 * 1024 // 150MB Max Limit (For large legacy source trees)
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".zip") {
      return cb(new Error("Only zipped repository bundles (.zip) are allowed!"), false);
    }
    cb(null, true);
  }
});

module.exports = upload;