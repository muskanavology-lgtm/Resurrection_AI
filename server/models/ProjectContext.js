const mongoose =
require("mongoose");

const ProjectContextSchema =
new mongoose.Schema({

projectId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Project"
},

filePath:String,

content:String

});

module.exports =
mongoose.model(
"ProjectContext",
ProjectContextSchema
);