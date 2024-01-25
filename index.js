const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require("jsonwebtoken");
const { getEventos, deleteEvento, verificarCredenciales, registrarUsuario } = require('./consultas')

app.listen(3000, console.log("SERVER ON"))
app.use(cors())
app.use(express.json())

app.get("/eventos", async (req, res) => {
    try {
        const eventos = await getEventos()
        res.json(eventos)
    } catch (error) {
        res.status(error.code || 500).send(error)
    }
})

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        await verificarCredenciales(email, password);
        // se genera el token
        const token = jwt.sign({email}, "Gato", {expiresIn: "7d"});//llave secreta debe estar en el archivo .env
        res.send(token)
    } catch (error) {
        console.log(error);
        res.status(error.code || 500).send(error);
    }
})

app.delete("/eventos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        //recibimos el token desde la cabezera
        const Authorization = req.header("Authorization");
        //Eliminamos el texto que no nos sirve
        const token = Authorization.split("Bearer ")[1];
        //verificar el token (que sea valido y vigente)
        jwt.verify(token, "Gato") //la clave debe estar en el .env
        //decodificar el token para obtener el payload
        const {email} = jwt.decode(token);
        await deleteEvento(id);
        res.send(`El usuario ${email} ha eliminado el evento de id ${id}`)
    } catch (error) {
        res.status(error.code || 500).send(error)
    }
})

app.post("/usuarios", async (req, res) => {
    try {
        const usuario = req.body;
        await registrarUsuario(usuario);
        res.send("Usuario creado con exito")
    } catch (error) {
        res.status(500).send(error)
    }
})