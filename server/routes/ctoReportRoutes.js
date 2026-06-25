const express = require("express");
const router = express.Router();

const Project =
require("../models/Project");

const askAI =
require("../ai/askAI");

router.get(
"/cto-report/:id",

async(req,res)=>{

try{

const project =
await Project.findById(
req.params.id
);

if(!project){

return res.status(404).json({
success:false,
message:"Project not found"
});

}

const prompt = `

You are a CTO.

Analyze this repository.

${JSON.stringify(project,null,2)}

Generate:

1 Executive Summary

2 Architecture Review

3 Security Review

4 Technical Debt

5 Missing Features

6 Scalability Analysis

7 Business Readiness

8 Recommended Roadmap

Return JSON.

`;

const report =
await askAI(prompt);

res.json({

success:true,

report

});

}
catch(error){

res.status(500).json({
success:false,
error:error.message
});

}

});

module.exports = router;