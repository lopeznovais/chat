const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    username: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 1
    },
    senha: {
        type: String,
        required: false
    }
})

mongoose.model("usuarios", Usuario)