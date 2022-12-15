const express = require('express')
const router  = express.Router()
const authController = require('../app/controllers/AuthController')

router.post('/register',authController.handleRegister)
router.post('/forgetPass/verify/:idUser',authController.handleVerifyOTP)
router.post('/forgetPass',authController.handleForgetPass)
router.post('/recoverPassword/:username',authController.handleRecoverPassword)
router.post('/login',authController.handleLogin)
router.post('/changePassword',authController.handleChangePassword)
router.post('/updateInformation',authController.handleUpdateInfor)
router.get('/logout',authController.handleLogout)


module.exports = router