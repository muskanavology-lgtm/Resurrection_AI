const { buildFileTree } = require("../utils/fileTreeCache");

/*
  FIX: ab disk dobara nahi padhta. Saath mein, ek important safety cap add
  kiya — pehle YE function project ke HAR file ka content (15000 chars tak)
  ek array mein collect karta tha, jise phir uploadController.js ek LOOP mein
  MongoDB mein ek-ek document karke save karta tha. Bade projects (500+
  files) ke liye, ye akela hi sequential DB writes ki wajah se 30-60+ second
  le sakta tha. Is function mein khud koi DB call nahi hai (wo
  uploadController mein hai — wahan batch insertMany() ka fix hai), par yahan
  hum sirf TEXT files include karte hain (tree cache already binary/large
  files ko skip karta hai), jisse list chhoti aur relevant rehti hai.
*/
function contextBuilder(projectPathOrTree) {
  const tree =
    typeof projectPathOrTree === "string"
      ? buildFileTree(projectPathOrTree).files
      : projectPathOrTree.files || projectPathOrTree;

  const files = [];
  for (const file of tree) {
    if (!file.content) continue; // binary/unreadable/too large — skip
    files.push({
      filePath: file.relativePath,
      content: file.content.substring(0, 15000),
    });
  }

  return files;
}

module.exports = contextBuilder;
