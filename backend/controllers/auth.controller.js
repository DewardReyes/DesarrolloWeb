const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/database");


// ==========================================
// REGISTRAR USUARIO
// ==========================================

async function register(req, res) {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Nombre, correo y contraseña son obligatorios."

            });

        }


        const [existingUsers] =
            await db.execute(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "El correo ya está registrado."

            });

        }


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const userRole =
            role === "admin"
                ? "admin"
                : "customer";


        const [result] =
            await db.execute(

                `INSERT INTO users
                (
                    name,
                    email,
                    password_hash,
                    role
                )
                VALUES (?, ?, ?, ?)`,
                
                [
                    name,
                    email,
                    passwordHash,
                    userRole
                ]

            );


        res.status(201).json({

            success: true,

            message:
                "Usuario creado correctamente.",

            userId:
                result.insertId

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Error interno del servidor."

        });

    }

}


// ==========================================
// LOGIN
// ==========================================

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Correo y contraseña son obligatorios."

            });

        }


        const [users] =
            await db.execute(

                `SELECT
                    id,
                    name,
                    email,
                    password_hash,
                    role
                 FROM users
                 WHERE email = ?`,

                [email]

            );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Correo o contraseña incorrectos."

            });

        }


        const user = users[0];


        const passwordValid =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordValid) {

            return res.status(401).json({

                success: false,

                message:
                    "Correo o contraseña incorrectos."

            });

        }


        const token =
            jwt.sign(

                {
                    id: user.id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "8h"
                }

            );


        res.json({

            success: true,

            message:
                "Inicio de sesión exitoso.",

            token,

            user: {

                id: user.id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Error interno del servidor."

        });

    }

}


module.exports = {
    register,
    login
};