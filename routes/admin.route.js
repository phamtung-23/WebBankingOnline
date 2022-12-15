const express = require('express')
const fileUpload = require('express-fileupload')
const router = express.Router();
const adminController = require('../app/controllers/AdminController')
const multer = require('multer');
const jwt = require('jsonwebtoken')
const db = require('../db_connect')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null,file.originalname)
  }
})
var upload = multer({ storage: storage })
// kiểm tra log in user

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

// trang Dashboard của admin
router.get('/dashboardUser',loggedIn,adminController.handleShowDashboard )
// xem thông tin từng user của admin 
router.get('/dashboardUser/profileUser/:idUser',loggedIn, adminController.handleShowInfoUser)
router.get('/dashboardUser/giaoDich',loggedIn, adminController.handleShowGiaoDich)
router.get('/getLichSuGD',loggedIn, adminController.handleShowLichSuGD)


router.post('/completeUser/:idUser', adminController.handleCompleteUser)
router.post('/deleteUser/:idUser', adminController.handleDeleteUser)
router.post('/upDateInfoUser/:idUser', adminController.handleUpdateInfoUser)
router.post('/upDateImage/:idUser',upload.array('myImage', 12),adminController.handleUpdateImage)
router.post('/restoreUser/:idUser', adminController.handleRestoreUser)

router.post('/xacNhanGiaoDich/:idGD',loggedIn, adminController.handleXacNhanGD)
router.post('/huyGiaoDich/:idGD',loggedIn, adminController.handleHuyGD)





module.exports = router