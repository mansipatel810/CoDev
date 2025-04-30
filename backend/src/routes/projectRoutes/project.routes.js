const router=require('express').Router();
const {body} = require('express-validator');
const projectController=require('../../controllers/projectController/project.controller');
const authMiddleware=require('../../middlewares/authMiddleware')


router.post('/create-project',
    authMiddleware,
    body('name').notEmpty().withMessage('Please provide a name'),
    projectController.createProject
); 

router.get('/get-all-projects',authMiddleware,projectController.getProjects);

router.put('/add-user',
    authMiddleware,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('users must be an array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
);

router.get('/get-project/:projectId',
    authMiddleware,
    body('projectId').isString().withMessage('Project ID is required'),
    projectController.getProjectById
);

router.put('update-file-tree',
    authMiddleware,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree must be an object'),
    projectController.updateFileTree
);
 
module.exports = router;