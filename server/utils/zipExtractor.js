const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

async function extractZip(zipPath) {

  const fileName =
    path.basename(zipPath, ".zip");

  const extractPath =
    path.join(
      __dirname,
      "../uploads/extracted",
      fileName
    );

  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, {
      recursive: true
    });
  }

  const zip =
    new AdmZip(zipPath);

  zip.extractAllTo(
    extractPath,
    true
  );

  return extractPath;
}

module.exports = extractZip;