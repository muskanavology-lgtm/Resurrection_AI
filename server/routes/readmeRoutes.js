const express =
require("express");

const router =
express.Router();

const Project =
require("../models/Project");

const askAI =
require("../ai/askAI");
router.get(
"/readme/:id",

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

You are a Senior Software Architect.

Generate professional README.md for this project.

PROJECT DATA:

${JSON.stringify(project,null,2)}

Include:

# Project Overview

# Architecture

# Tech Stack

# Folder Structure

# Features

# API Documentation

# Database Design

# Installation Guide

# Deployment Guide

# Security Notes

# Future Improvements

Return clean markdown format.

`;

const readme =
await askAI(prompt);

res.json({

success:true,

readme

});

}
catch(error){

res.status(500).json({

success:false,
error:error.message

});

}

});module.exports = router;