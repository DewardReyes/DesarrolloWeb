const jwt = require("jsonwebtoken");


// ==========================================
// VERIFICAR TOKEN
// ==========================================

function verifyToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Token de acceso requerido."

            });

        }


        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Formato de token inválido."

            });

        }


        const token = parts[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Token inválido o expirado."

        });

    }

}


// ==========================================
// SOLO ADMIN
// ==========================================

function adminOnly(req, res, next) {

    if (
        !req.user ||
        req.user.role !== "admin"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Acceso exclusivo para administradores."

        });

    }


    next();

}


module.exports = {
    verifyToken,
    adminOnly
};