const db = require('../../db_connect')
// const fs = require('fs');
// const path = require('path');
class AdminController{
  // hiển thị giao diện trang dashboard 
  handleShowDashboard(req, res, next){
    if(req.user){
      if(req.user.LoaiTaiKhoan==1){
        res.render('admin/dashboard', {isLogin:true,data:req.user})
      }else{
        res.redirect('/')
      }
    }else{
      res.redirect('/login')
    }
    
  }

  // xem chi tiết từng user yêu cầu xác minh tài khoản
  handleShowInfoUser(req, res, next){
    if(req.user){
      if(req.user.LoaiTaiKhoan==1){
        db.query('select * from user where username = ?',[req.params.idUser], async (err, result)=>{
          if(err) throw err
          if(result.length <= 0){
            res.render('admin/profileUser', {error :'Tài khoản không tồn tại!!!'})
          }else{
            // console.log(result[0])
            db.query('select * from cccd where username = ?',[req.params.idUser], async (err, result1)=>{
              if(err) throw err
              if(result1.length <= 0){
                res.render('admin/profileUser', {dataUser: result[0], status:false, isLogin:true,data: req.user})
              }else{
                // console.log(path.join(__dirname, 'resources/views'))
                res.render('admin/profileUser', {dataUser: result[0], status:true, images:result1[0], isLogin:true,data: req.user})
              }
            })
          }
        })
      }else{
        res.redirect('/')
      }
    }else{
      res.redirect('/login')
    }
    
  }
  // hiển thị giao diện các giao dịch đã thực hiện
  handleShowGiaoDich(req, res, next){
    res.render('admin/dashboard_GiaoDich')
  }
  //lấy  thông tin giao dịch trên database
  handleShowLichSuGD(req, res, next){
    db.query('SELECT * FROM `thongtingd`', async (err, result)=>{
      if(err){throw err}
      if(result){
        res.json({user: result})
        // console.log(result)
      }else{
        console.log('không thể lấy thông tin giao Dịch')
      }
    })
  }

  // xử lý xác nhận giao Dịch
  handleXacNhanGD(req, res, next){
    const idGD = req.params.idGD

    if (!idGD){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `thongtingd` SET `xacMinhGD`=? WHERE IdGD = ?',[1, idGD], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Xác minh Giao dịch thành công!!!'})
        }else{
          res.json({status:'error', success:'Xác minh Thất bại!!!'})
        }
      })
    }
  }
  // xử lý hủy giao dịch
  handleHuyGD(req, res, next){
    const idGD = req.params.idGD

    if (!idGD){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `thongtingd` SET `xacMinhGD`=? WHERE IdGD = ?',[2, idGD], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Đã hủy giao dịch thành công!!!'})
        }else{
          res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
        }
      })
    }
  }
  // [POST] apiUser/completeUser
  // xác nhận tài khoản từ phía admin
  handleCompleteUser(req, res, next){
    const userName = req.params.idUser

    if (!userName){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[1, userName], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Xác minh tài khoản thành công!!!'})
        }else{
          res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
        }
      })
    }
  }

  // vô hiệu hóa tài khoản từ phía admin
  handleDeleteUser(req, res, next){
    const userName = req.params.idUser

    if (!userName){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[2, userName], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Tài khoản đã được vô hiệu hóa!!!'})
        }else{
          res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
        }
      })
    }
  }
  // chuyển sang trạng thái chờ cập nhật tài khoản từ phía admin
  handleUpdateInfoUser(req, res, next){
    const userName = req.params.idUser

    if (!userName){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[3, userName], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Đã gửi yêu cầu cập nhật!!!'})
        }else{
          res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
        }
      })
    }
  }
  // khôi phục tài khoản cho user bị vô hiệu hóa từ phía admin
  handleRestoreUser(req, res, next){
    const userName = req.params.idUser

    if (!userName){
      res.json({status:'error', error: 'Đã xảy ra lỗi'})
    }else {
      db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[0, userName], (err, result)=>{
        if(err){throw err}
        if(result.affectedRows == 1){
          res.json({status:'success', success:'Khôi phục tài khoản thành công!!!'})
        }else{
          res.json({status:'error', success:'Đã xảy ra lỗi!!!'})
        }
      })
    }
  }
// xử lý upload ảnh và lưu hình ảnh vào database
  handleUpdateImage(req, res, next){
    // console.log(req.body)
    const files = req.files
    const imagesT = files[0].originalname
    const imagesS = files[1].originalname
    const idUsername = req.params.idUser

    if (!idUsername || !imagesT || !imagesS) {
      res.send({status:'error', error:'Vui lòng chọn đầy đủ thông tin!!!'})
    }else{
      db.query('select * from cccd where username = ?',[idUsername], async (err, result2)=>{
        if (err)throw err
        if (result2.length<=0){
          db.query('INSERT INTO `cccd`(`username`, `matTruoc`, `matSau`) VALUES (?,?,?)', [idUsername,imagesT,imagesS], async (err, result)=>{
            if (err)throw err
            if(result.affectedRows != 1){
              res.redirect('/profile')
            }else{
              db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[0, idUsername], async(err, result)=>{
                if (err)throw err
                if(result.affectedRows != 1){
                  res.redirect('/profile')
                }else{
                  res.redirect('/profile')
                }
              })
            }
    
          })

        }else{
          db.query('UPDATE `cccd` SET `matTruoc`=?,`matSau`=? WHERE username = ?', [imagesT,imagesS,idUsername], async (err, result)=>{
            if (err)throw err
            if(result.affectedRows != 1){
              res.redirect('/profile')
            }else{
              db.query('UPDATE `user` SET `trangthai`=? WHERE username = ?',[0, idUsername], async(err, result)=>{
                if (err)throw err
                if(result.affectedRows != 1){
                  res.redirect('/profile')
                }else{
                  res.redirect('/profile')
                }
              })
            }
    
          })
        }
      })


      // res.json({status:'success', success:'Update Thành công!!'})

    }
  }
}
module.exports = new AdminController;

