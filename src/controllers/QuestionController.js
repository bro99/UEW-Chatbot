const Message = require('../model/Message')

module.exports = {
    // BUSCAR
    async index(req, res) {
        try {
            const message = await Message.find({},{"_id": false, "__v":false})
            return message
        } catch (error) {
            // return res.status(500).send({erro: error}) 
        }
    },

    // CRIAR
    async create(req, res) {
        // try {
            // const message = await Message.find()
            const newMessage = new Message(req.body)
            newMessage.save()
            res.redirect('treinamento')
        // } catch (error) {
        //     res.redirect(`/treinamento`)
        // }
    }
}