const express = require("express");
const router = express.Router();

const Project =
require("../models/Project");

const askAI =
require("../ai/askAI");

router.post(
"/generate-code/:id",

async(req,res)=>{

try{

const { feature } =
req.body;

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

You are a Senior Software Architect.

PROJECT ANALYSIS:

${JSON.stringify(
project.analysis,
null,
2
)}

PROJECT STRUCTURE:

${JSON.stringify(
project.scanResult,
null,
2
)}

ROUTES:

${JSON.stringify(
project.routes,
null,
2
)}

DEPENDENCIES:

${JSON.stringify(
project.dependencyGraph,
null,
2
)}

Generate complete implementation for:

${feature}

Requirements:

1 Generate folder structure

2 Generate all files

3 Generate full code

4 Follow existing architecture

5 Explain where each file goes

6 Explain integration steps

`;

const answer =
await askAI(prompt);

res.json({

success:true,

feature,

generated:
answer

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