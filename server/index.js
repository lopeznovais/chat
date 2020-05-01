const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const passport = require("passport")
const handlebars = require("express-handlebars")
require("./models/Mensagem")
const Mensagem = mongoose.model("mensagens")
require("./models/Usuario")
const Usuario = mongoose.model("usuarios")
const path = require("path")

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

// Sessão
app.use(session({
  secret: "nodejs",
  receive: true,
  saveUninitialized: true,
  resave: true,
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/chat", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Conectado ao mongoDB")
}).catch((err) => {
  console.log("Erro ao se conectar ao mongoDB " + err)
})

// Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.error = req.flash("error")
  res.locals.user = req.user || null;
  next()
})


// Body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Handlebars
app.engine('handlebars', handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

// Public
app.use(express.static(path.join(__dirname, "public")))

io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, bem vindo a sala ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} juntou-se a sala!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const novaMensagem = new Mensagem({
      usuario: user.name,
      room: user.room,
      conteudo: message
    })

    novaMensagem.save().then(() => {
      console.log("Mensagem salva")
      io.to(user.room).emit('message', { user: user.name, text: message });
    }).catch((err) => {
      console.log("Erro: ", err)
    })


    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} saiu da sala.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
  })
});

server.listen(process.env.PORT || 8081, () => console.log(`Servidor rodando.`));