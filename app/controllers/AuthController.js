const db = require('../../db_connect')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

class AuthController{
  // render giao diện
  // [GET] /register
  renderRegister(req, res, next){
    res.render('account/register')
  }

  // [GET] /login
  renderLogin(req, res, next){
    if(req.user){
      res.redirect("/")
    }else{
      res.render('account/login')
    }
    
  }
  // render giao diện khôi phục password
  renderForgetPass(req, res, next){
    res.render('account/forgetPass')
  }
  // [GET] /changePassword
  renderChangePassword(req, res, next){
    if(req.user){
      if(req.user.DangNhapLanDau==1){
        res.render('account/changePassword', {status: true, data: req.user})
      }else{
        res.render('account/changePassword', {status: false, data: req.user})
      }
    }else{
      res.render('account/changePassword', {status: false, data: req.user})
    }
    // res.render('account/changePassword')
  }
  // xử lí tạo tài khoản
  // [POST] /register
  async handleRegister(req, res, next){
    const {email, password} = req.body
    if (!email || !password) {
      res.json({status: "error", error: "Vui lòng nhập dữ liệu dùn cái"})
    }else{
      db.query('select COUNT(Email) as count from user where Email = ?',[email], async (err, result)=>{
        if(err) {throw err}
        if (result[0].count > 0){
          res.json({status: "error", error:"Email này sài rồi ba ơi!!!", data: result})
        }
        else{
          const pass = await bcrypt.hashSync(password, 8)
          db.query('INSERT INTO `user`(`Email`, `password`) VALUES (?,?)',[email, pass], async (err, result) => {
            if(err) throw err
              res.json({status: "success", success:"Tạo tài khoản thành công rồi đó, Đăng nhập đi!"})
          })
        }
        
      } )
    }
  }

  // xử lý đang nhập
  // [POST] api/login
  
  async handleLogin(req, res, next){
    let isAdmin = false;
    const {email, password, count} = req.body
    if (!email || !password){
      res.json({status: "error", error:"làm ơn điền email với pass cái đi"})
    }else{
      // kiểm tra có phải admin hay không
      db.query("SELECT LoaiTaiKhoan from user where Email = ?",[email],async(err,result2)=>{
        if(result2[0].LoaiTaiKhoan==0){
          if(count==3){
            db.query('UPDATE `user` SET `trangthai`=? WHERE Email = ?',[2, email], (err, result)=>{
              if(err){throw err}
              if(result.affectedRows == 1){
                res.json({status:'error', error:'Tài khoản đã được vô hiệu hóa, vì nhập sai nhiều  lần!!!'})
              }else{
                res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
              }
            })
            // res.json({status: "error", error:"Tài khoản đã bị khóa tàm thời vì nhập sai 3 lần"})
          }else{
            db.query('select * from user where Email = ?', [email],async (err, result) => {
              if(err) throw err
              if(!result.length || !await bcrypt.compare(password, result[0].password)){
                res.json({status: 'error', error:"email hoặc pass của m ko đúng kìa"})
              }else{
                // kiểm tra xem tài khoản có bị vô hiệu hóa hay không
                db.query('select trangthai from user where Email = ?',[email],async (err, result1) => {
                  if(err) throw err
                  if(result1[0].trangthai==2){
                    res.json({status:'error', error:'Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ 180021313'})
                  }else{
                    // đăng nhập thành công
                    const token = jwt.sign({username: result[0].username},"ghsdfiuyieurhefbhsvafyfifernfefvurty847330", {
                      expiresIn: "90d"
                    })
                    const cookieOptions = {
                      expiresIn: new Date(Date.now()+ 90 * 24 * 60 * 60 * 1000),
                      httpOnly: true
                    } 
        
                    res.cookie("usernameRegister", token, cookieOptions)
                    res.json({status: 'success', success:"mày đăng nhập thành công rồi", data: result[0]})
                  }
                  
                })
                
              }
            })
          }
        }else{
          db.query('select * from user where Email = ?', [email],async (err, result) => {
            if(err) throw err
            if(!result.length || !await bcrypt.compare(password, result[0].password)){
              res.json({status: 'error', error:"email hoặc pass của m ko đúng kìa"})
            }else{
              // kiểm tra xem tài khoản có bị vô hiệu hóa hay không
              db.query('select trangthai from user where Email = ?',[email],async (err, result1) => {
                if(err) throw err
                if(result1[0].trangthai==2){
                  res.json({status:'error', error:'Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ 180021313'})
                }else{
                  // đăng nhập thành công
                  const token = jwt.sign({username: result[0].username},"ghsdfiuyieurhefbhsvafyfifernfefvurty847330", {
                    expiresIn: "90d"
                  })
                  const cookieOptions = {
                    expiresIn: new Date(Date.now()+ 90 * 24 * 60 * 60 * 1000),
                    httpOnly: true
                  } 
      
                  res.cookie("usernameRegister", token, cookieOptions)
                  res.json({status: 'success', success:"mày đăng nhập thành công rồi", data: result[0]})
                }
                
              })
              
            }
          })
        }
      })
      // check nhập sai pass 3 lần sẽ khóa tài khoản
      
    }
  }
  // xử lý changePassword
  // [POST] /api/changePassword
  async handleChangePassword(req, res, next) {
    const {email,password, confirmPassword} = req.body
    // res.json({email: email, password: password})
    if(password != confirmPassword) {
      res.json({status: 'error', error:'Mật khẩu không khớp'})
    }else{
      const pass = await bcrypt.hashSync(password, 8)
      db.query('UPDATE `user` SET `password`=?,`DangNhapLanDau`= 0 WHERE Email=?',[pass,email], async (err, result)=>{
        if(err){throw err}
        if(result.affectedRows==1){
          res.json({status: 'success',success:'Thay đổi thành công!!'})
        }else{
          res.json({status: 'error', error:'thay đổi thất bại!'})
        }
      })
    }
  }
  // render giao diện lấy lại mật khẩu khi Quên
  // [GET] /recoverPassword
  renderRecoverPassword(req, res, next){
    res.render('account/recoverPassword',{username:req.params.username})
  }
  // xử lý tạo lại mật khẩu mới khi Quên
  // [POST] /recoverPassword/:username
  async handleRecoverPassword(req, res, next){
    const username = req.params.username;
    const {password, confirmPassword} = req.body
    if(password != confirmPassword) {
      res.json({status: 'error', error:'Mật khẩu không khớp'})
    }else{
      const pass = await bcrypt.hashSync(password, 8)
      db.query('UPDATE `user` SET `password`=?,`DangNhapLanDau`= 0 WHERE username=?',[pass,username], async (err, result)=>{
        if(err){throw err}
        if(result.affectedRows==1){
          res.json({status: 'success',success:'Thay đổi thành công!!'})
        }else{
          res.json({status: 'error', error:'thay đổi thất bại!'})
        }
      })
    }
  }
  //  Xử lý cập nhật duex liệu
  // [GET] /api/updateInformation
  async handleUpdateInfor (req, res, next) {
    // console.log(req.body)
    const {name, sdt, emailCurrent, birthday, address} = req.body
    if(!name || !sdt || !emailCurrent || !birthday || !address){
      res.json({status: 'error', error: 'Mày điền đầy đủ thông tin cho t à!'})
    }else{
      db.query('UPDATE `user` SET `SoDienThoai`=?,`HoVaTen`=?,`NgayThangNamSinh`=?,`DiaChi`=? WHERE Email = ?',[sdt,name, birthday, address, emailCurrent], (err, result)=>{
        if(err) throw err
        if(result.affectedRows !=1 ){
          res.json({status: 'error', error: 'Không thể cập nhật!!'})
        }else{
          res.json({status: 'success', success:'Cập nhật thông tin thành công!!'})
        }
      })
    }
  }

  // xử lý gửi mail để khôi phục password
  async handleForgetPass(req, res, next){
    const {email} = req.body
    let userName = '';
    let randomOTP = Math.floor(Math.random() * (999999 - 100000) + 100000);
    db.query("SELECT username from user WHERE Email = ?",[email], async(err, result)=>{
      if(err) throw err
      if(result.length<=0){
        res.json({status: 'error', error:'Email không tồn tại!!!'})
      }else{
        userName = result[0].username
      }
      console.log('UserName: '+userName)
    })
    console.log(email)
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
        user: 'pttung23082001@gmail.com', // generated ethereal user
        pass: 'iddsxkvtynkatpxv', // generated ethereal password
      },
    });

    // send mail with defined transport object
    await transporter.sendMail({
      from: "pttung23082001@gmail.com", // sender address
      to: email, // list of receivers
      subject: "OTP-Restore Password", // Subject line
      // text: "Mã xác minh của bạn là: 123456", // plain text body
      html: `<p>${randomOTP} là mã xác minh của bạn.</p>`, // html body
    },(err) => {
      if(err){
        res.json({status:'error', error:'Gửi lỗi'})
      }else{
        db.query('INSERT INTO `otp`(`username`, `OTPKey`) VALUES (?,?)',[userName, randomOTP], async (err, result)=>{
          if(err) throw err
          if(result.affectedRows != 1){
            res.json({status:'error', error:'Đã xảy ra lỗi!!!'})
          }else{
            res.json({status:'success', success:'Đã gửi Gmail đến mail của bạn!', data: userName})
          }
        })
      }
    });
    
  }
  // rander giao diện verify
  renderVerifyOTP(req, res, next){
    let userName = req.params.idUser
    db.query('select Email from user where username = ?',[userName],async (err, result)=>{
      if(err){throw err}
      res.render('account/verifyOTP',{email:result[0].Email, userName})
    })
  }
  // xử lý xác thực OTP
  handleVerifyOTP(req, res, next){
    const userName = req.params.idUser
    const {otp} = req.body
    let count = 0;
    if(!userName){
      res.json({status:'error', error:'Đã xảy ra lỗi trong quá trình xác thực!'})
    }else{
      db.query('select OTPKey from otp where username = ?',[userName], async (err, results)=>{
        if(err){throw err}
        for (let i = 0; i < results.length; i++) {
          if(results[i].OTPKey == otp){
            count = count + 1
          }
        }
        if(count==1){
          db.query('DELETE FROM `otp` WHERE username = ?',[userName], async (err, results)=>{
            if(err){throw err}
            res.json({status:'success', success:'Xác thực otp thành công!', data: userName})
          })
        }else{
          res.json({status:'error', error:'Đã xảy ra lỗi xác thực!'})
        }
      })
    }
  }
  // xử lý logout and
  // [GET] /api/logout
  handleLogout(req, res, next){
    res.clearCookie("usernameRegister");
    res.redirect("/")
  }
}

module.exports = new AuthController; 