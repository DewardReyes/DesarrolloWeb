const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

require("./config/database");

const authRoutes = require("./routes/auth.routes");

const productRoutes =
    require("./routes/products.routes");

const orderRoutes =
    require("./routes/orders.routes");

const app = express();


// ==========================================
// MIDDLEWARES
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ==========================================
// ARCHIVOS ESTÁTICOS
// ==========================================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ==========================================
// RUTA PRINCIPAL
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "🚀 SmartPhone RD API funcionando",
        version: "1.0.0"
    });

});


// ==========================================
// RUTAS
// ==========================================



app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);


// ==========================================
// MANEJO DE ERRORES
// ==========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });

});


// ==========================================
// SERVIDOR
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`
========================================
      SMARTPHONE RD API
========================================

Servidor:
http://localhost:${PORT}

Estado:
🟢 Funcionando

========================================
    `);

});

// ==========================================
// FRONTEND
// ==========================================

app.use(
    "/frontend",
    express.static(
        path.join(__dirname, "../frontend")
    )
);