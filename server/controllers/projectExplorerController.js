const fs = require("fs");
const path = require("path");

function buildTree(dir) {
  const result = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {

    const fullPath =
      path.join(dir, file);

    const stat =
      fs.statSync(fullPath);

    if (stat.isDirectory()) {

      result.push({
        name: file,
        type: "folder",
        children:
          buildTree(fullPath)
      });

    } else {

      result.push({
        name: file,
        type: "file",
        path: fullPath
      });

    }
  }

  return result;
}

const getProjectTree =
async (req, res) => {

  try {

    const { projectPath } =
      req.body;

    const tree =
      buildTree(projectPath);

    res.json({
      success: true,
      tree
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
};

module.exports = {
  getProjectTree
};