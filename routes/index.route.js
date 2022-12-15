
const homeRouter = require('./homePage.route')
const authRouter = require('./auth.route')
const userRouter = require('./user.route')
const adminRouter = require('./admin.route')


function route(app){
  app.use('/apiUser', userRouter)
  app.use('/api', authRouter)
  app.use('/', homeRouter)
  app.use('/user', userRouter)
  app.use('/admin', adminRouter)
}
module.exports = route;