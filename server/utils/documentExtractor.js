const fs = require("fs");
const path = require("path");

/*
  NAYA FEATURE ke liye support file: documentation file (.txt, .md, .pdf,
  .docx) se plain text nikalta hai, jise phir AI ko bhejte hain project plan
  banane ke liye.

  IMPORTANT — INSTALL ZARURI HAI (agar PDF/DOCX support chahiye):
    npm install pdf-parse mammoth

  Agar ye install nahi hain, .txt aur .md files tab bhi kaam karengi
  (sabse common case), PDF/DOCX ke liye clear error message milega instead
  of a silent crash.
*/

async function extractDocumentText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf8");
  }

  if (ext === ".pdf") {
    let pdfParse;
    try {
      pdfParse = require("pdf-parse");
    } catch {
      throw new Error(
        "PDF support needs the 'pdf-parse' package. Run: npm install pdf-parse"
      );
    }
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    let mammoth;
    try {
      mammoth = require("mammoth");
    } catch {
      throw new Error(
        "DOCX support needs the 'mammoth' package. Run: npm install mammoth"
      );
    }
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error(`Unsupported document type: ${ext}. Use .txt, .md, .pdf, or .docx`);
}

module.exports = extractDocumentText;
