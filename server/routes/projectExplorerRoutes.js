const express = require("express");
const router = express.Router();
const { getProjectTree } = require("../controllers/projectExplorerController");
router.post("/project-tree", getProjectTree);
module.exports = router;