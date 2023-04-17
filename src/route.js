const express = require('express')
const route = express.Router()
const QuestionController = require('../src/controllers/QuestionController')


route.get('/', async (req, res) =>{
    // TODO OS CALCULOS OU REQUISIÇÔES PARA RENDERIZAR O QUE VOCÊ QUISER
   res.render('index')
})

route.get('/treinamento', async (req, res) =>{
    // QuestionController.create()
    const message = await QuestionController.index()
     res.render('treinamento', {message:message})
})
route.post('/treinamento', QuestionController.create)

module.exports = route