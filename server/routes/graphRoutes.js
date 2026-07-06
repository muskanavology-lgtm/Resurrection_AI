const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
router.get("/graph/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }
        const graph = project.knowledgeGraph || { nodes: [], edges: [] };
        res.json({
            success: true,
            graph
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
router.post("/graph/:id",async (req,res)=>{
    try{
        const project =await Project.findById(req.params.id);
        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found "
            });
        }
        const graph=project.knowldgeGraph||{nodes:[],edges:[]};
        res.json({
            success:false,
          graph
    });
    }
    catch(error){
        res.status(500).json({
            success:false,
            error:error.message
        });
    }
});
router.post("graph/:id",async(req,res)=>{
    try{
        const project=await Project.findById(req,params.id);
        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            });
        }
        const graph=project.knowledgeGraph||{nodes:[],edges:[]};
        res.json({
            success:false,
            graph
        });
    }
    catch(error){
        res.status(500).json({
            success:false,
            error:error.message
        });
    }
});
router.post("/about",async(req,res)=>{
    try{
        const project=await Project.findById(REq,params);
        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            });
        }
        const graph=project.knowledgeGraph||{nodes:[],edges:[]};
        res.json({
            success:false,
            graph
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