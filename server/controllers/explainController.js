const explainFile =
require("../analyzers/fileExplainer");

const explainProjectFile =
(req, res) => {

  try {

    const { filePath } = req.body;

    const result =
      explainFile(filePath);

    res.json({
      success: true,
      result
    });
    
  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

module.exports = {
  explainProjectFile
};