const bcrypt = require("bcryptjs");
const db = require("./config/database");

async function createAdmin() {

    try {

        const name = "Deward Reyes";
        const email = "dewnicole2929@gmail.com";
        const password = "Nadie292925";

        const passwordHash = await bcrypt.hash(password, 12);

        const [existing] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {

            console.log("❌ Ese correo ya existe.");

            process.exit(0);
        }

        const [result] = await db.execute(
            `INSERT INTO users
            (name, email, password_hash, role)
            VALUES (?, ?, ?, 'admin')`,
            [
                name,
                email,
                passwordHash
            ]
        );

        console.log("");
        console.log("=================================");
        console.log("   ADMINISTRADOR CREADO");
        console.log("=================================");
        console.log("");
        console.log("ID:", result.insertId);
        console.log("Nombre:", name);
        console.log("Correo:", email);
        console.log("Rol: admin");
        console.log("");
        console.log("=================================");

        process.exit(0);

    } catch (error) {

        console.error(
            "❌ Error creando administrador:"
        );

        console.error(error);

        process.exit(1);
    }
}

createAdmin();