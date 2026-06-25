const mongoose = require("mongoose");

const ChatSessionSchema =
new mongoose.Schema({

projectId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Project",
required:true
},

messages:[
{
role:String,
content:String,
timestamp:{
type:Date,
default:Date.now
}
}
],

createdAt:{
type:Date,
default:Date.now
}

});

module.exports =
mongoose.model(
"ChatSession",
ChatSessionSchema
);