const express = require("express");

const router = express.Router();


const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getCustomerOrders,
    getCustomers,
    getInventoryMovements
} = require("../controllers/orders.controller"); require("../controllers/orders.controller");

// =====================================================
// CREAR PEDIDO
// =====================================================

router.post(
    "/",
    createOrder
);



// =====================================================
// LISTAR TODOS LOS PEDIDOS
// =====================================================

router.get(
    "/",
    getOrders
);



// =====================================================
// LISTAR CLIENTES
// IMPORTANTE:
// Esta ruta debe estar antes de /:id
// =====================================================

router.get(
    "/customers",
    getCustomers
);

// =====================================================
// OBTENER PEDIDOS ANTERIORES DE UN CLIENTE
// =====================================================

router.get(
    "/customer-orders",
    getCustomerOrders
);

// =====================================================
// MOVIMIENTOS DE INVENTARIO POR PRODUCTO
// IMPORTANTE:
// Esta ruta debe estar antes de /:id
// =====================================================

router.get(
    "/inventory-movements/:productId",
    getInventoryMovements
);

// =====================================================
// VER PEDIDO POR ID
// =====================================================

router.get(
    "/:id",
    getOrderById
);



// =====================================================
// CAMBIAR ESTADO DEL PEDIDO
// =====================================================

router.put(
    "/:id/status",
    updateOrderStatus
);



// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;