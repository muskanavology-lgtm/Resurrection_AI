const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
router.get("/health/:id",
    async (req, res) => {
        try {
            const project = await Project.findById(req.params.id);
            res.json({
                success: true,
                health: project.healthScore
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

module.exports = router;