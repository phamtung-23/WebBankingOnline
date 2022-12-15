
const homeRouter = require('./homePage.route')
const authRouter = require('./auth.route')
const userRouter = require('./user.route')


function route(app){
  app.use('/apiUser', userRouter)
  app.use('/api', authRouter)
  app.use('/', homeRouter)
  app.use('/user', userRouter)
}
module.exports = route;