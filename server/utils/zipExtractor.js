const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

/*
  🟢 BIGGEST PERFORMANCE WIN (read this):

  Pehle (ya agar aapka extractor sab kuch extract karta tha), agar koi
  developer galti se apna `node_modules` zip mein include kar deta
  (React/Next.js projects mein bahut common — 20,000-50,000+ tiny files),
  to wo SAB disk par extract hota tha, phir har analyzer unhe scan karta tha.

  FIX: extraction ke time hi skip kar dete hain. node_modules/.git/.next/
  dist/build/vendor jaisi directories KABHI disk par likhi hi nahi jaati.
  Isse extraction khud fast hai, aur baad ke saare analyzers (jo already
  shared tree cache use kar rahe hain) automatically kam files dekhte hain.
*/

const SKIP_DIR_PREFIXES = [
  "node_modules/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  "vendor/",
  ".cache/",
  "coverage/",
  "__pycache__/",
  ".venv/",
  "venv/",
];

function shouldSkip(entryName) {
  const normalized = entryName.replace(/\\/g, "/");
  return SKIP_DIR_PREFIXES.some(
    (prefix) => normalized.includes(`/${prefix}`) || normalized.startsWith(prefix)
  );
}

async function extractZip(zipFilePath) {
  const zip = new AdmZip(zipFilePath);
  const entries = zip.getEntries();

  // Extract to a folder named after the zip file (sibling to the upload),
  // e.g. uploads/169999-myproject.zip -> uploads/169999-myproject_extracted/
  const baseName = path.basename(zipFilePath, path.extname(zipFilePath));
  const extractDir = path.join(path.dirname(zipFilePath), `${baseName}_extracted`);

  if (!fs.existsSync(extractDir)) {
    fs.mkdirSync(extractDir, { recursive: true });
  }

  let skipped = 0;
  let extracted = 0;

  for (const entry of entries) {
    if (shouldSkip(entry.entryName)) {
      skipped++;
      continue;
    }

    const targetPath = path.join(extractDir, entry.entryName);

    // Defend against zip-slip (entries trying to write outside extractDir)
    const resolvedTarget = path.resolve(targetPath);
    const resolvedRoot = path.resolve(extractDir);
    if (!resolvedTarget.startsWith(resolvedRoot)) {
      skipped++;
      continue;
    }

    if (entry.isDirectory) {
      fs.mkdirSync(resolvedTarget, { recursive: true });
      continue;
    }

    fs.mkdirSync(path.dirname(resolvedTarget), { recursive: true });
    fs.writeFileSync(resolvedTarget, entry.getData());
    extracted++;
  }

  console.log(`[extractZip] Extracted ${extracted} files, skipped ${skipped} (node_modules/.git/etc).`);

  // If the zip had a single top-level folder (common when zipping a repo
  // via "Download ZIP" on GitHub), descend into it so analyzers see the
  // real project root instead of one extra wrapper folder.
  const topLevelEntries = fs.readdirSync(extractDir);
  if (topLevelEntries.length === 1) {
    const onlyPath = path.join(extractDir, topLevelEntries[0]);
    if (fs.statSync(onlyPath).isDirectory()) {
      return onlyPath;
    }
  }

  return extractDir;
}

module.exports = extractZip;
