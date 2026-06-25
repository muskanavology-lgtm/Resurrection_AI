const express = require("express");

const router = express.Router();

const {
  explainProjectFile
} = require(
  "../controllers/explainController"
);

router.post(
  "/explain-file",
  explainProjectFile
);

module.exports = router;