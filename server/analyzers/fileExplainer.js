const fs = require("fs");

const explainFile = (filePath) => {
  try {

    const content = fs.readFileSync(
      filePath,
      "utf8"
    );

    const lines =
      content.split("\n").length;

    const functions = [];

    const regex =
      /function\s+([a-zA-Z0-9_]+)/g;

    let match;

    while (
      (match = regex.exec(content))
    ) {
      functions.push(match[1]);
    }

    return {
      fileName:
        filePath.split("\\").pop(),

      totalLines: lines,

      functions,

      preview:
        content.substring(0, 1000)
    };

  } catch (error) {

    return {
      error: error.message
    };

  }
};

module.exports = explainFile;