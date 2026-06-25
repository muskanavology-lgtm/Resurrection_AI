const express =
require("express");

const router =
express.Router();

const Project =
require("../models/Project");

const askAI =
require("../ai/askAI");

const analyzer =
require(
"../analyzers/featureRecommendationAnalyzer"
);

router.get(
"/recommendations/:id",

async(req,res)=>{

try{

const project =
await Project.findById(
req.params.id
);

const result =
await analyzer(
project,
askAI
);

res.json({

success:true,

recommendations:
result

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