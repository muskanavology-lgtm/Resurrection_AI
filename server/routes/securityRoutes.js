const express = require("express");
const router = express.Router();

const Project =
require("../models/Project");

router.get(
"/security/:id",
async(req,res)=>{

try{

const project =
await Project.findById(
req.params.id
);

res.json({

success:true,

issues:
project.securityIssues || []

});

}
catch(error){

res.status(500).json({
error:error.message
});

}

});

module.exports = router;