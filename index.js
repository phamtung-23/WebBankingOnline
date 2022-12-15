const express = require('express')
const path = require('path')
const handlebars = require('express-handlebars')
const routes = require('./routes/index.route')
const cookie = require('cookie-parser')
const db = require('./db_connect')
const date = require('date-and-time')


const app = express()
app.use(cookie())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploads')))


// xử lý form data
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

app.engine('hbs', handlebars.engine({
  extname:'.hbs', 
  helpers:{
    soSanh: (a,b) => {
      if (a == b) return true
      else return false
    },
    convertDate: (dates) => {
      return (dates.getMonth()+1)+'/'+dates.getFullYear();
    },
    convertFullDate: (dates) => {
      return dates.getDate()+'/'+(parseInt(dates.getMonth())+1)+'/'+dates.getFullYear();
    },
    getMoneyTk: (username)=>{
      // let tongTien = 0
      return 
    }
  }
}));
app.set('view engine','hbs')
app.set('views', path.join(__dirname, 'resources/views'))
// app.get('/',(req, res, next)=>{
//   res.render('home')
// })
// app.get('/account/login',(req, res, next)=>{
//   res.render('account/login')
// })
db.connect((err)=>{
  if(err) throw err
  console.log("Database connected!!!!")
})
routes(app);


app.listen(3000,()=>{console.log('listening on port: http://localhost:3000')})