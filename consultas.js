const { Pool } = require('pg')
const bcrypt = require("bcryptjs")

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '21481642',
    database: 'vida_sana',
    allowExitOnIdle: true
})

const getEventos = async () => {
    const { rows: eventos } = await pool.query("SELECT * FROM eventos")
    return eventos
}

const deleteEvento = async (id) => {
    const consulta = "DELETE FROM eventos WHERE id = $1"
    const values = [id]
    const { rowCount } = await pool.query(consulta, values)
    if (!rowCount) throw { code: 404, message: "No se encontró ningún evento con este ID" }
}

// Validar las credenciales de un usuario
/* const verificarCredenciales = async (email, password) => {

    //NEcesitamos consultar a nuestra base de datos por las credenciales
    const consulta = "SELECT * FROM usuarios WHERE email = $1 AND password = $2";
    const values = [email, password];
    const { rowCount } = await pool.query(consulta, values);
    if (!rowCount) {
        throw {
            code: 404,
            message: "No se encontro ningun usuario con estas credenciales"
        }
    }
} */

const verificarCredenciales = async (email, password) => {
    const consulta = "SELECT * FROM usuarios WHERE email = $1";
    const values = [email];

    const {
        rows: [usuario],
        rowCount
    }= await pool.query(consulta, values);

    const {password: passwordEncriptada} = usuario;
    const passwordEsCorrecta = bcrypt.compareSync(password, passwordEncriptada)
    if (!passwordEsCorrecta || !rowCount) {
        throw {
            code: 401,
            message: "Email o contraseña incorrecta"
        }
    }
}

//Registrar usuarios con contraseñas protegidas
const registrarUsuario = async (usuario) => {
    let {email, password} = usuario;
    const passwordEncriptada = bcrypt.hashSync(password);
    password = passwordEncriptada;
    const consulta = "INSERT INTO usuarios VALUES(DEFAULT, $1, $2)"
    const values = [email, passwordEncriptada];
    await pool.query(consulta, values)
}

module.exports = { getEventos, deleteEvento, verificarCredenciales, registrarUsuario }
