const express =
require("express");

const router =
express.Router();

const Project =
require("../models/Project");

const repositorySearchEngine =
require(
"../analyzers/repositorySearchEngine"
);

router.post(
"/repository-search",

async(req,res)=>{

try{

const {
projectId,
keyword
} = req.body;

const project =
await Project.findById(
projectId
);

if(!project){

return res.status(404).json({

success:false,
message:"Project not found"

});

}

const result =
repositorySearchEngine(

project.extractedPath,
keyword

);

res.json({

success:true,

count:
result.length,

results:
result.slice(0,50)

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