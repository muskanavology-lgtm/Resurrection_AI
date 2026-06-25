const express = require("express");
const router = express.Router();

const Project =
require("../models/Project");

const askAI =
require("../ai/askAI");

router.get(
"/security-ai/:id",

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

const report =
project.securityReport;

const prompt = `

You are a Senior Security Architect.

Generate:

1 Executive Summary

2 Security Score Analysis

3 Critical Findings

4 High Findings

5 Medium Findings

6 Exploitation Scenario

7 Business Impact

8 Developer Fix

9 Secure Code Example

10 Final Recommendations

Security Report:

${JSON.stringify(report,null,2)}

`;

const aiReport =
await askAI(prompt);

res.json({

success:true,

securityScore:
report.securityScore,

grade:
report.grade,

audit:
aiReport

});

}
catch(error){

res.status(500).json({

success:false,
error:error.message

});

}

});

module.exports =
router;