const router= require('express').Router();
const userController = require('../../controllers/userController/user.controller');
const authMiddleware=require('../../middlewares/authMiddleware')
const {body} = require('express-validator');

router.post('/register',
    body('userName').notEmpty().withMessage('Please provide a name'),
    body('email').isEmail().withMessage('Please provide a valid email'),    
    userController.userRegister);

router.post('/login',
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Please provide a password'),
    userController.userLogin);
    
router.get('/current-user',authMiddleware,userController.currentUser);
router.get('/logout',authMiddleware,userController.userLogout)
router.get('/get-all-users',authMiddleware,userController.getAllUsers)

router.get('/validate', userController.validateUser);

module.exports = router;