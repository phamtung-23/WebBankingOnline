const express = require('express')
const router = express.Router()
const authController = require('../app/controllers/AuthController')
const db = require('../db_connect')
const jwt = require('jsonwebtoken')
const path = require('path')

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
// trang home
router.get('/',loggedIn, (req, res, next)=>{
  if(req.user){
    if(req.user.DangNhapLanDau==1){
      res.redirect('/changePassword')
    }else{
      db.query('SELECT `SoDu` FROM `taikhoan` WHERE username = ?',[req.user.username], async (err, result1)=>{
        if (err) throw err
        if (result1.length>0){
          res.render('home',{isLogin:true, data:req.user,checkSoDu: true , soDu:result1[0].SoDu})
        }else{
          res.render('home',{isLogin:true, data:req.user, soDu:'0'})
        }
      })
      
    }
  }else{
    res.render('home', {isLogin:false, data:"bạn nên dăng nhập"})
  }
})
// trang thông tin cá nhân
router.get('/profile',loggedIn, (req, res, next)=>{
  if(req.user){
    if(req.user.DangNhapLanDau==1){
      res.redirect('/changePassword')
    }else{
      res.render('infor/profile',{isLogin:true, data:req.user})
    }
  }else{
    res.redirect("/login")
  }
})
// trang cập upload ảnh căn cước công dân
router.get('/profile/uploadImg', loggedIn,(req, res,next)=>{
  if(req.user){
    res.render('infor/uploadImg',{data: req.user})
  }else{
    res.redirect("/login")
  }
})
// trang cập nhật thông tin
router.get('/profile/update',loggedIn, (req, res, next)=>{
  if(req.user){
    if(req.user.DangNhapLanDau==1){
      res.redirect('/changePassword')
    }else{
      res.render('infor/updateInfor',{isLogin:true, data:req.user})
    }
  }else{
    res.redirect("/login")
  }
})
// giao diện tạo tài khoản
router.get('/register',authController.renderRegister)
router.get('/forgetPass/verify/:idUser',authController.renderVerifyOTP)
router.get('/forgetPass',authController.renderForgetPass)
// giao diện đăng nhập
router.get('/login',loggedIn,authController.renderLogin)
// gaio diện thay đổi password
router.get('/changePassword',loggedIn,authController.renderChangePassword)
router.get('/recoverPassword/:username',authController.renderRecoverPassword)
module.exports = router