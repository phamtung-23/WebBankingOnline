const db = require('../../db_connect')
const fs = require('fs');
const path = require('path');



class UserController{
  // [GET] apiUser/getUser
  // lấy danh sách user
  handleGetUser(req, res, next){
    db.query("SELECT * FROM user", (err, results)=>{
      if(err) throw err
      if (results.length == 0){
        res.json({status: 1, message:'Danh sách trống!!'})
      }else if(results.length>0){
        res.json({status: 2, user: results})
      }else{
        res.json({status: 0, message:'Lỗi khi tải danh sách'})
      }
    })
  }
  



  // hiển thị giao diện điền thông tin thẻ tín dụng cho người dùng
  handleNapTien(req, res, next){
    if(req.user){
      db.query('SELECT * FROM `thetindung`',async(err, result)=>{
        if(err){throw err}
        if(result){
          res.render('user/napTien',{status: true, inforThe: result, data:req.user, isLogin:true})
        }else{
          res.render('user/napTien',{status: false})
        }
      })
    }else{
      res.render('account/login')
    }
    // res.render('user/napTien')
  }
  // hiển thị trang nhập số tiền cần nạp
  handleTTNapTien(req, res, next){
    if(req.user){
      db.query('SELECT * FROM `thetindung`',async(err, result)=>{
        if(err){throw err}
        if(result){
          res.render('user/TTNapTien',{status: true, inforThe: result, data:req.user, isLogin:true})
        }else{
          res.render('user/TTNapTien',{status: false})
        }
      })
    }else{
      res.render('account/login')
    }
    // res.render('user/napTien')
  }
  // xử lý nạp tiền vào tài khoản
  handleNapTienTK(req, res, next){
    const {soTien} = req.body
    const username  = req.user.username
    if (!soTien || !username){
      res.json({status: 'error', error: 'Vui lòng nhập đầy đủ thông tin!!!'})
    }else{
      db.query('SELECT SoDu FROM `taikhoan` WHERE username = ?',[username], async(err, result)=>{
        if (err) throw err
        if (result.length>0){
          const tongTien = parseInt(result[0].SoDu) + parseInt(soTien);
          console.log(tongTien)
          db.query('UPDATE `taikhoan` SET `SoDu`=? WHERE username = ?',[ tongTien.toString(), username],async(err, result1)=>{
            if (err) throw err
            if(result1.affectedRows){
              db.query('INSERT INTO `thongtingd`( `username`, `TenGD`, `GhiChu`,`xacMinhGD`) VALUES (?,?,?,1)',[username,'Nạp Tiền','Nạp tiền thôi!!!'], async(err, result3)=>{
                if (err) throw err
                if(result3.affectedRows){
                  res.json({status:'success', success:'Nạp Tiền Thành công!!!'})
                }
              })
            }else{
              res.json({status:'error', error:'Nạp tiền thất bại!!'})
            }
          })
        }else{
          db.query('INSERT INTO `taikhoan`(`username`, `SoDu`, `GiaoDichConLai`) VALUES (?,?,"5")',[username, soTien],async(err, result2)=>{
            if (err) throw err
            if(result2.affectedRows){
              db.query('INSERT INTO `thongtingd`( `username`, `TenGD`, `GhiChu`,`xacMinhGD`) VALUES (?,?,?,1)',[username,'Nạp Tiền','Nạp tiền thôi!!!'], async(err, result3)=>{
                if (err) throw err
                if(result3.affectedRows){
                  res.json({status:'success', success:'Nạp Tiền Thành công!!!'})
                }
              })
            }else{
              res.json({status:'error', error:'Nạp tiền thất bại!!'})
            }
          })
        }
      })
    }
  }
  // Kiểm tra thông tin thẻ ngân hàng
  handleInsertPaymentCard(req, res, next){
    const {soThe, ngayHetHan, codeCVV} = req.body
    if (!soThe || !ngayHetHan || !codeCVV){
      res.json({status:'error', error:'vui long nhap day du thong tin'})
    }else{
      db.query('SELECT COUNT(SoThe) AS count FROM `thetindung` WHERE SoThe = ? and NgayHethan = ? and CVV = ?',[soThe,ngayHetHan ,codeCVV], async (err, result)=>{
        if (err) throw err
        if (result[0].count==0) {
          res.json({status:'error', error:'The khong ton tai!'})
        }else if (result[0].count==1){
          res.json({status:'success',success:'Xac nhan the thanh cong!!'})
        }
      })
    }
  }

  //Xem lịch sử 
  handleLichSuGD(req, res, next){
    if(req.user){
      db.query('SELECT * FROM `thongtingd` WHERE username = ?',[req.user.username],async(err, result)=>{
        if(err){throw err}
        if(result){
          res.render('user/lichSuGD',{data:req.user,lichSu:result, isLogin:true})
        }else{
          res.render('user/lichSuGD',{isLogin:true})
        }
      })
    }else{
      res.render('account/login')
    }
  }
// hiển thị giao diện rút tiền
  handleRutTien(req, res, next) {
    res.render('user/rutTien',{ isLogin:true,data: req.user})
  }

// xử lý rút tiền về tài khoản
  handleRutTienTK(req, res, next){
    const {soThe, ngayHetHan , codeCVV, soTienRut} = req.body
    const username = req.user.username
    if (!soThe || !ngayHetHan || !codeCVV|| !username){
      res.json({status:'error', error:'vui long nhap day du thong tin'})
    }else{
      db.query('SELECT COUNT(SoThe) AS count FROM `thetindung` WHERE SoThe = ? and NgayHethan = ? and CVV = ?',[soThe,ngayHetHan ,codeCVV], async (err, result)=>{
        if (err) throw err
        if (result[0].count==0) {
          res.json({status:'error', error:'The khong ton tai!'})
        }else if (result[0].count==1){
          db.query('SELECT `SoDu` FROM `taikhoan` WHERE username = ?',[username], async(err, result1)=>{
            if (err) throw err
            if (result1){
              if (soTienRut >= result1[0].SoDu){
                res.json({status:'error',error:'Số dư không đủ!!'})
              }else {
                const tongTien = parseInt(result1[0].SoDu) - parseInt(soTienRut);
                let xacNhan = 0;
                if (tongTien<5000000){
                  xacNhan = 1;
                }else{
                  xacNhan = 0;
                }
                console.log(tongTien)
                db.query('UPDATE `taikhoan` SET `SoDu`=? WHERE username = ?',[ tongTien.toString(), username],async(err, result2)=>{
                  if (err) throw err
                  if(result2.affectedRows){
                    db.query('INSERT INTO `thongtingd`( `username`, `TenGD`, `GhiChu`,`xacMinhGD`) VALUES (?,?,?,?)',[username,'Rút TIền','Rút tiền thôi nà!!!',xacNhan], async(err, result3)=>{
                      if (err) throw err
                      if(result3.affectedRows){
                        res.json({status:'success', success:'Rút Tiền Thành công!!!'})
                      }else{
                        res.json({status:'error', error:'Rút tiền thất bại!!'})
                      }
                    })
                  }else{
                    res.json({status:'error', error:'Rút tiền thất bại!!'})
                  }
                })
              }
            }else{
              res.json({status:'error',error:'Tài khoản không có tiền!!!'})
            }
          })

          // res.json({status:'success',success:'Xac nhan the thanh cong!!'})
        }
      })
    }
  }
  //Hiển thị giao diện chuyển Tiền
  handleChuyenTien(req, res, next){
    db.query('SELECT `maNganHang`, `tenNganHang`, `icon` FROM `thongtintknganhang`',async(err, result)=>{
      if (err) {throw err}
      if (result){
        // console.log(result)
        res.render('user/chuyenTien',{infoNH: result, isLogin:true,data: req.user})
      }
    })
  }
  //kiểm tra ngân hàng có chính xác Không
  handleCheckNH(req, res, next){
    const {soTK,maNH} = req.body
    // const username = req.user
    
    db.query('SELECT * FROM `tknganhang` WHERE STK = ?',[soTK], async(err, result)=>{
      if (err) {throw err}
      if (result){
        // console.log(result[0].STK)
        res.json({status: 'success', thongTinTKNH:result[0].STK})
      }else{
        res.json({status: 'error', error:'Tài khoản không tồn tại!!!'})
      }
    })
  }

  //hiện thị giao diện nhập số Tiền
  handleNhapSoTien(req, res, next){
    const stk = req.params.stk
    db.query('SELECT * FROM `tknganhang` WHERE STK = ?',[stk],async(err, result)=>{
      if(err) throw err
      if(result){
        // console.log(result[0].maNganHang)
        db.query('SELECT * FROM `thongtintknganhang` WHERE maNganHang = ?',[result[0].maNganHang], async(err, result1)=>{
          // console.log(result1[0].icon)
          db.query('SELECT `HoVaTen` FROM `user` WHERE username = ?',[req.user.username], async(err, result2)=>{
            // console.log(result2[0])
            db.query('SELECT `SoDu` FROM `taikhoan` WHERE username = ?',[req.user.username], async(err, result3)=>{
              if(err) {throw err}
              if(result3){
                res.render('user/inputMoney',{thongTinTaiKhoan: result[0], thongTinNganHang: result1[0],HoVaTen: result2[0].HoVaTen, soDu:result3[0].SoDu,  isLogin:true,data: req.user})
              }
            })
          })
        })
      }
    })
  }

  // xử lý chuyển tiền đến tài khoản khác
  handleChuyenDenTaiKhoan(req, res, next){
    const {TKGoc,TkNhan,soTienChuyen} = req.body
    const username = req.user.username
    // console.log(TKGoc,TkNhan,soTienChuyen)
    db.query('SELECT `SoDu`FROM `taikhoan` WHERE username = ?',[username], async(err, result)=>{
      if (err) throw err
      if (result){
        if (result[0].SoDu > soTienChuyen){
          let tongTien  = result[0].SoDu - soTienChuyen
          db.query('UPDATE `taikhoan` SET `SoDu`=? WHERE username = ?',[tongTien,username], async(err, result1)=>{
            if (err) throw err
            if (result1.affectedRows == 1){
              db.query('SELECT `SoDuTK`FROM `tknganhang` WHERE STK = ?',[TkNhan], async(err, result2)=>{
                if (err) throw err
                if (result2){
                    let tongTien  = parseInt(result2[0].SoDuTK) + parseInt(soTienChuyen)
                    // console.log(tongTien)
                    let xacNhan = 0
                    if(soTienChuyen >= 5000000){
                      xacNhan = 0
                    }else{
                      xacNhan = 1
                    }
                    db.query('UPDATE `tknganhang` SET `SoDuTK`=? WHERE STK = ?',[tongTien,TkNhan], async(err, result3)=>{
                      if (err) throw err
                      if (result3.affectedRows == 1){
                        db.query('INSERT INTO `thongtingd`( `username`, `TenGD`, `GhiChu`,`xacMinhGD`) VALUES (?,?,?,?)',[username,'Chuyển TIền','Chuyển  tiền thôi nà!!!',xacNhan], async(err, result4)=>{
                          if (err) throw err
                          if (result4.affectedRows==1){
                            res.json({status: 'success', success: 'Chuyển tiền thành công!!!'})
                          }else{
                            res.json({status: 'error', error:'Chuyển tiền thất bại!!!'})
                          }
                        })
                      }else{
                        res.json({status: 'error', error:'Chuyển tiền thất bại!!!'})
                      }
                    })
                  
                }else{
                  res.json({status: 'error', error:'Chuyển tiền thất bại!!!'})
                }
              })
            }else{
              res.json({status: 'error', error:'Chuyển tiền thất bại!!!'})
            }
          })
        }
      }
    })
  }

  //hiển thị giao diện nạp thẻ cáo điên thoại
  handlenNpTheCao(req, res, next){
    res.render('user/napTheCaoTest',{isLogin: true,data:req.user})
  }

  // xử lý nạp tiền điện thoại
  handlenNapTienDT(req, res, next){
    const {numberPhone,nhaMang,menhGia} = req.body;
    db.query('SELECT `SoDuTK`FROM `tknganhang` WHERE username = ?',[req.user.username], async(err, result)=>{
      if (err) throw err
      if (result){
        if (result[0].SoDuTK > (parseInt(menhGia)*1000)){
          let maSoThe = ''
          let tongTien  = result[0].SoDuTK - (parseInt(menhGia)*1000)
          db.query('SELECT `MaThe` FROM `themua` WHERE NhaMang = ?',[nhaMang], async(err, result2)=>{
            if(err) throw err
            if(result2){
              // console.log(result2)
              maSoThe = result2[0].MaThe + (Math.floor(Math.random() * (9999 - 1000) ) + 1000).toString()
              // console.log(maSoThe)
              db.query('UPDATE `tknganhang` SET `SoDuTK`=? WHERE username = ?',[tongTien, req.user.username], async(err, result1)=>{
                if (err) throw err
                // console.log(result1)
                if(result1.affectedRows == 1){
                  let xacNhan = 1
                  db.query('INSERT INTO `thongtingd`( `username`, `TenGD`, `GhiChu`,`xacMinhGD`) VALUES (?,?,?,?)',[req.user.username,'Nạp tiền điện thoại','Mua thẻ cào điện thoại thôi mà!!!',xacNhan], async(err, result4)=>{
                    if (err) throw err
                    if (result4.affectedRows==1){
                      res.json({status:'success', success:'Mua thẻ thành công!!!', maSoThe:maSoThe})
                    }else{
                      res.json({status: 'error', error:'Chuyển tiền thất bại!!!'})
                    }
                  })
                }else{
                  res.json({status:'error', error:'Lỗi mua thẻ!!'})
                }
              })
            }else{
              res.json({status:'error', error:'Lỗi mua thẻ!!'})
            }
          })
          // console.log(tongTien)
          // res.json({status:'error', error:'Lỗi mua thẻ!!'})
        }else{
          res.json({status:'error', error:'Số dư không đủ!!'})
        }
      }else{
        res.json({status:'error', error:'Lỗi mua thẻ!!'})
      }
    })
  }
}

module.exports = new UserController;