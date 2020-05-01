const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("./models/Mensagem")
const Mensagem = mongoose.model("mensagens")
require("./models/Usuario")
const Usuario = mongoose.model("usuarios")
const passport = require("passport")
const bcrypt = require("bcryptjs")

router.get("/", (req, res) => {
    res.render("admin/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin",
        failureRedirect: "/",
        failureFlash: true
    })(req, res, next)
})

router.get("/admin", (req, res) =>{
    Mensagem.find().lean().sort({data: "desc"}).then((mensagens) => {
        res.render("admin/index", {mensagens: mensagens})
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro interno")
        res.redirect("/404")
    })
})

router.get("/registro", (req, res) => {
    res.render("admin/registro")
})

router.post("/registro", (req, res) =>{
    var erros = []
    if(!req.body.username || typeof req.body.username == undefined || req.body.username == null){
        erros.push({texto: "Username inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas estão diferentes, tente novamente!"})
    }
    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({username: req.body.username}).lean().then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail cadastrada no sistema")
                res.redirect("/registro")
            }else{
                const novoUsuario = new Usuario({
                    username: req.body.username,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash("success_msg", "Usuário criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário")
                            res.redirect("/registro")
                        })
                    })
                })
            }
        }).catch((err)=> {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

module.exports = router