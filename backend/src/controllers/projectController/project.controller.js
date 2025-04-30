const Project = require('../../models/projectModel/project.model');
const User = require('../../models/userModel/user.model');
const { validationResult } = require('express-validator');
const customError = require('../../utils/customError');

const createProject = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Please provide a name' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        let project;
        try {
            project = await Project.create({
                name,
                users: [user._id],
                fileTree: {},
            });
        }catch (error) {
            return next(new customError('Project already exist', 500));
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        return next(new customError(error.message, 500));
    }
};


const getProjectById = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ error: 'Please provide a projectId' });
        }


        const project = await Project.findOne({ _id: projectId }).populate('users', 'name email userName');
        if (!project) {
            return res.status(400).json({ error: 'Project not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Project fetched successfully',
            data: project,
        });
    } catch (error) {
        return next(new customError(error.message, 500));
        
    }
}

const getProjects = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const projects = await Project.find({ users: user._id }).populate('users', 'name email');

        res.status(200).json({
            success: true,
            message: 'Projects fetched successfully',
            data: projects,
        });
    } catch (error) {
        return next(new customError(error.message, 500));
    }
}

const addUserToProject = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        if (!projectId || !users) {
            return res.status(400).json({ error: 'Please provide a projectId and users' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }


        const project = await Project.findOne({ _id: projectId , users: user._id });
        if (!project) {
            return res.status(400).json({ error: 'User not belong to this project' });
        } 

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            { $addToSet: { users: { $each: users } } },
            { new: true, runValidators: true }
        ).populate('users', 'name email');
        if (!updatedProject) {
            return res.status(400).json({ error: 'Project not found' });
        }
         
        await project.save();

        res.status(200).json({
            success: true,
            message: 'User added to project successfully',
            data: project,
        });
    } catch (error) {
        return next(new customError(error.message, 500));
    }
};



const updateFileTree = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    try {
        const { projectId, fileTree } = req.body;
        if (!projectId) {
            throw new Error("projectId is required")
        }
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new Error("Invalid projectId")
        }
        
        if (!fileTree) {
            throw new Error("fileTree is required")
        }

        const project = await projectModel.findOneAndUpdate({
            _id: projectId
        }, {
            fileTree
        }, {
            new: true
        })

        if (!project) {
            throw new Error("Project not found")
        }
        res.status(200).json({
            success: true,
            message: "File tree updated successfully",
            project
        })

    } catch (error) {
        
    }
}


module.exports = {
    createProject,
    getProjects,
    addUserToProject,
    getProjectById,
    updateFileTree
};