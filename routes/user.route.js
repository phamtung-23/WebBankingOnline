const express = require('express')
const fileUpload = require('express-fileupload')
const router = express.Router();
const userController = require('../app/controllers/UserController')
const multer = require('multer');
const jwt = require('jsonwebtoken')
const db = require('../db_connect')
// SET STORAGE: chọn nơi lưu trữ và tên file cần lưu
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname)
  }
})
var upload = multer({ storage: storage })

// kiểm tra cookie dăng nhập
function loggedIn(req, res, next) {
  if(!req.cookies.usernameRegister){return next()}
  try {
    const decoded = jwt.verify(req.cookies.usernameRegister, "ghsdfiuyieurhefbhsvafyfifernfefvurty847330")
    
    db.query("SELECT * FROM user WHERE username = ?", [decoded.username], (err, result) => {
      if (err) throw err
      req.user = result[0]
      return next()
    })
  }
  catch(err){
    if(err) return next()
  }
}

// xử lý về tài khoản user
router.post('/completeUser/:idUser', userController.handleCompleteUser)
router.post('/deleteUser/:idUser', userController.handleDeleteUser)
router.post('/upDateInfoUser/:idUser', userController.handleUpdateInfoUser)
router.post('/upDateImage/:idUser',upload.array('myImage', 12),userController.handleUpdateImage)
router.post('/restoreUser/:idUser', userController.handleRestoreUser)
router.get('/getUser', userController.handleGetUser)

// Xữ lý về các chức năng user
router.get('/TTNapTien',loggedIn, userController.handleTTNapTien)
router.get('/rutTien',loggedIn, userController.handleRutTien)
router.get('/chuyenTien',loggedIn, userController.handleChuyenTien)
router.get('/chuyenTien/nhapSoTien/:stk',loggedIn, userController.handleNhapSoTien)
router.get('/napTien',loggedIn, userController.handleNapTien)
router.get('/lichSuGD',loggedIn, userController.handleLichSuGD)

router.post('/chuyenTien/denTaiKhoan',loggedIn, userController.handleChuyenDenTaiKhoan)
router.post('/chuyenTien/checkNH',loggedIn, userController.handleCheckNH)
router.post('/napTien', userController.handleInsertPaymentCard)
router.post('/rutTien',loggedIn, userController.handleRutTienTK)
router.post('/TTNapTien',loggedIn, userController.handleNapTienTK)



module.exports = router
