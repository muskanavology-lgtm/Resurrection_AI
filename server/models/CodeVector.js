const mongoose = require("mongoose");

const ChatVectorSchema =
new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  filePath: String,

  content: String,

  embedding: {
    type: [Number],
    default: []
  }

}, {
  timestamps: true
});

module.exports =
mongoose.model(
  "ChatVector",
  ChatVectorSchema
);