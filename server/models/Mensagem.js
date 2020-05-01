const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Mensagem = new Schema({
    usuario: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("mensagens", Mensagem)