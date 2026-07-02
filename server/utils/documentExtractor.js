const fs = require("fs");
const path = require("path");

async function extractDocumentText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf8");
  }

  if (ext === ".pdf") {
    try {
      const pdfParseModule = require("pdf-parse");
      // pdf-parse newer versions export object with default property
      const pdfParse = typeof pdfParseModule === "function"
        ? pdfParseModule
        : pdfParseModule.default || pdfParseModule;

      if (typeof pdfParse !== "function") {
        throw new Error("pdf-parse loaded but is not callable");
      }

      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    } catch (err) {
      if (err.message.includes("Cannot find module")) {
        throw new Error("PDF support needs the 'pdf-parse' package. Run: npm install pdf-parse");
      }
      throw new Error("PDF parsing failed: " + err.message);
    }
  }

  if (ext === ".docx") {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (err) {
      if (err.message.includes("Cannot find module")) {
        throw new Error("DOCX support needs the 'mammoth' package. Run: npm install mammoth");
      }
      throw new Error("DOCX parsing failed: " + err.message);
    }
  }

  throw new Error(`Unsupported document type: ${ext}. Use .txt, .md, .pdf, or .docx`);
}

module.exports = extractDocumentText;
