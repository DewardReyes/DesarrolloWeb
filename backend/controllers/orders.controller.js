const db =
    require("../config/database");


// =====================================================
// CONFIGURACIÓN
// =====================================================

const SHIPPING_COST = 250;


// =====================================================
// CREAR PEDIDO
// =====================================================

const createOrder = async (
    req,
    res
) => {

    let connection = null;


    try {

        const {
            customer,
            products
        } = req.body;


        // =================================================
        // VALIDAR CLIENTE
        // =================================================

        if (!customer) {

            return res.status(400).json({

                success: false,

                message:
                    "Los datos del cliente son obligatorios."

            });

        }


        const requiredFields = [

            "name",
            "phone",
            "email",
            "province",
            "city",
            "address",
            "payment_method"

        ];


        for (
            const field
            of requiredFields
        ) {

            if (
                !customer[field] ||
                String(
                    customer[field]
                ).trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `El campo ${field} es obligatorio.`

                });

            }

        }


        // =================================================
        // VALIDAR PRODUCTOS
        // =================================================

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El pedido debe contener productos."

            });

        }


        // =================================================
        // CONEXIÓN
        // =================================================

        connection =
            await db.getConnection();


        await connection.beginTransaction();


        let subtotal = 0;


        const validatedProducts = [];


        // =================================================
        // VALIDAR PRODUCTOS Y STOCK
        // =================================================

        for (
            const item
            of products
        ) {

            const productId =
                Number(
                    item.product_id
                );


            const quantity =
                Number(
                    item.quantity
                );


            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {

                throw new Error(
                    "ID de producto inválido."
                );

            }


            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity <= 0
            ) {

                throw new Error(
                    "Cantidad inválida."
                );

            }


            // =============================================
            // OBTENER PRODUCTO Y BLOQUEARLO
            // =============================================

            const [rows] =
                await connection.execute(

                    `
                    SELECT
                        id,
                        brand,
                        model,
                        price,
                        stock
                    FROM products
                    WHERE id = ?
                    FOR UPDATE
                    `,

                    [
                        productId
                    ]

                );


            if (
                !rows.length
            ) {

                throw new Error(

                    `El producto ${productId} no existe.`

                );

            }


            const product =
                rows[0];


            const stock =
                Number(
                    product.stock
                );


            // =============================================
            // VALIDAR STOCK
            // =============================================

            if (
                stock < quantity
            ) {

                throw new Error(

                    `No hay suficiente stock para ${product.brand} ${product.model}. Disponible: ${stock}.`

                );

            }


            const price =
                Number(
                    product.price
                );


            const itemSubtotal =
                price * quantity;


            subtotal +=
                itemSubtotal;


            // =============================================
            // GUARDAR PRODUCTO VALIDADO
            // =============================================

            validatedProducts.push({

                productId,

                quantity,

                price,

                subtotal:
                    itemSubtotal,

                previousStock:
                    stock

            });

        }


        // =================================================
        // CALCULAR TOTAL
        // =================================================

        const shipping =
            SHIPPING_COST;


        const total =
            subtotal +
            shipping;


        // =================================================
        // INSERTAR PEDIDO
        // =================================================

        const [orderResult] =
            await connection.execute(

                `
                INSERT INTO orders (
                    customer_name,
                    customer_phone,
                    customer_email,
                    province,
                    city,
                    address,
                    reference_address,
                    payment_method,
                    subtotal,
                    shipping,
                    total,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,

                [
                    customer.name,
                    customer.phone,
                    customer.email,
                    customer.province,
                    customer.city,
                    customer.address,
                    customer.reference ||
                        null,
                    customer.payment_method,
                    subtotal,
                    shipping,
                    total,
                    "pendiente"
                ]

            );


        const orderId =
            orderResult.insertId;


        // =================================================
        // REGISTRAR CREACIÓN EN HISTORIAL
        // =================================================

        await connection.execute(

            `
            INSERT INTO order_status_history (
                order_id,
                previous_status,
                new_status
            )
            VALUES (?, ?, ?)
            `,

            [
                orderId,
                null,
                "pendiente"
            ]

        );


        // =================================================
        // INSERTAR PRODUCTOS
        // DESCONTAR STOCK
        // REGISTRAR MOVIMIENTO
        // =================================================

        for (
            const item
            of validatedProducts
        ) {

            // =============================================
            // INSERTAR PRODUCTO EN EL PEDIDO
            // =============================================

            await connection.execute(

                `
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
                `,

                [
                    orderId,
                    item.productId,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]

            );


            // =============================================
            // STOCK
            // =============================================

            const previousStock =
                Number(
                    item.previousStock
                );


            const quantity =
                Number(
                    item.quantity
                );


            const newStock =
                previousStock -
                quantity;


            // =============================================
            // DESCONTAR STOCK
            // =============================================

            await connection.execute(

                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,

                [
                    quantity,
                    item.productId
                ]

            );


            // =============================================
            // REGISTRAR MOVIMIENTO
            // =============================================

            await connection.execute(

                `
                INSERT INTO inventory_movements (
                    product_id,
                    type,
                    quantity,
                    previous_stock,
                    new_stock,
                    reason,
                    order_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,

                [
                    item.productId,
                    "salida",
                    quantity,
                    previousStock,
                    newStock,
                    "Pedido creado",
                    orderId
                ]

            );

        }


        // =================================================
        // CONFIRMAR TRANSACCIÓN
        // =================================================

        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Pedido creado correctamente.",

            orderId,

            subtotal,

            shipping,

            total

        });


    } catch (error) {


        // =================================================
        // ROLLBACK
        // =================================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (
                rollbackError
            ) {

                console.error(
                    "Error haciendo rollback:",
                    rollbackError
                );

            }

        }


        console.error(
            "Error creando pedido:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Error al crear el pedido."

        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

};



// =====================================================
// LISTAR TODOS LOS PEDIDOS
// =====================================================

const getOrders = async (
    req,
    res
) => {

    try {

        const [orders] =
            await db.execute(

                `
                SELECT
                    id,
                    customer_name,
                    customer_phone,
                    customer_email,
                    province,
                    city,
                    address,
                    reference_address,
                    payment_method,
                    subtotal,
                    shipping,
                    total,
                    status,
                    created_at
                FROM orders
                ORDER BY created_at DESC
                `

            );


        return res.json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedidos:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Error obteniendo los pedidos."

        });

    }

};



// =====================================================
// OBTENER PEDIDO POR ID
// =====================================================

const getOrderById = async (
    req,
    res
) => {

    try {

        const orderId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(
                orderId
            ) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID de pedido inválido."

            });

        }


        const [orders] =
            await db.execute(

                `
                SELECT
                    id,
                    customer_name,
                    customer_phone,
                    customer_email,
                    province,
                    city,
                    address,
                    reference_address,
                    payment_method,
                    subtotal,
                    shipping,
                    total,
                    status,
                    created_at
                FROM orders
                WHERE id = ?
                `,

                [
                    orderId
                ]

            );


        if (
            !orders.length
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Pedido no encontrado."

            });

        }


        const [items] =
            await db.execute(

                `
                SELECT
                    oi.id,
                    oi.product_id,
                    oi.quantity,
                    oi.price,
                    oi.subtotal,
                    p.brand,
                    p.model,
                    p.image
                FROM order_items oi
                LEFT JOIN products p
                    ON p.id = oi.product_id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC
                `,

                [
                    orderId
                ]

            );


        return res.json({

            success: true,

            order: {

                ...orders[0],

                items

            }

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedido:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Error obteniendo el pedido."

        });

    }

};



// =====================================================
// CAMBIAR ESTADO DEL PEDIDO
// CONTROL DE INVENTARIO + HISTORIAL
// =====================================================

const updateOrderStatus = async (
    req,
    res
) => {

    let connection = null;


    try {

        const orderId =
            Number(
                req.params.id
            );


        const {
            status
        } = req.body;


        // =================================================
        // VALIDAR ID
        // =================================================

        if (
            !Number.isInteger(
                orderId
            ) ||
            orderId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID de pedido inválido."

            });

        }


        // =================================================
        // ESTADOS PERMITIDOS
        // =================================================

        const allowedStatuses = [

            "pendiente",
            "confirmado",
            "enviado",
            "entregado",
            "cancelado"

        ];


        const normalizedStatus =
            String(
                status || ""
            )
                .trim()
                .toLowerCase();


        if (
            !allowedStatuses.includes(
                normalizedStatus
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Estado de pedido inválido.",

                allowedStatuses

            });

        }


        // =================================================
        // CONEXIÓN
        // =================================================

        connection =
            await db.getConnection();


        await connection.beginTransaction();


        // =================================================
        // OBTENER PEDIDO ACTUAL
        // BLOQUEAR REGISTRO
        // =================================================

        const [orders] =
            await connection.execute(

                `
                SELECT
                    id,
                    status
                FROM orders
                WHERE id = ?
                FOR UPDATE
                `,

                [
                    orderId
                ]

            );


        if (
            !orders.length
        ) {

            await connection.rollback();


            return res.status(404).json({

                success: false,

                message:
                    "Pedido no encontrado."

            });

        }


        const currentStatus =
            String(
                orders[0].status || ""
            )
                .trim()
                .toLowerCase();


        // =================================================
        // MISMO ESTADO
        // =================================================

        if (
            currentStatus ===
            normalizedStatus
        ) {

            await connection.commit();


            return res.json({

                success: true,

                message:
                    "El pedido ya tiene ese estado.",

                orderId,

                previousStatus:
                    currentStatus,

                status:
                    currentStatus

            });

        }


        // =================================================
        // FLUJO PERMITIDO
        // =================================================

        const validTransitions = {

            pendiente: [

                "confirmado",
                "cancelado"

            ],

            confirmado: [

                "enviado",
                "cancelado"

            ],

            enviado: [

                "entregado",
                "cancelado"

            ],

            entregado: [],

            cancelado: [

                "pendiente",
                "confirmado",
                "enviado"

            ]

        };


        // =================================================
        // VALIDAR TRANSICIÓN
        // =================================================

        if (
            !validTransitions[
                currentStatus
            ] ||
            !validTransitions[
                currentStatus
            ].includes(
                normalizedStatus
            )
        ) {

            await connection.rollback();


            return res.status(400).json({

                success: false,

                message:
                    `No se puede cambiar el pedido de "${currentStatus}" a "${normalizedStatus}".`

            });

        }


        // =================================================
        // OBTENER PRODUCTOS DEL PEDIDO
        // BLOQUEAR PRODUCTOS
        // =================================================

        const [items] =
            await connection.execute(

                `
                SELECT
                    oi.product_id,
                    oi.quantity,
                    p.brand,
                    p.model,
                    p.stock
                FROM order_items oi
                INNER JOIN products p
                    ON p.id = oi.product_id
                WHERE oi.order_id = ?
                FOR UPDATE
                `,

                [
                    orderId
                ]

            );


        // =================================================
        // ACTIVO → CANCELADO
        // DEVOLVER STOCK
        // REGISTRAR ENTRADA
        // =================================================

        if (
            currentStatus !== "cancelado" &&
            normalizedStatus === "cancelado"
        ) {

            for (
                const item
                of items
            ) {

                const quantity =
                    Number(
                        item.quantity
                    );


                const previousStock =
                    Number(
                        item.stock
                    );


                const newStock =
                    previousStock +
                    quantity;


                // =========================================
                // DEVOLVER STOCK
                // =========================================

                await connection.execute(

                    `
                    UPDATE products
                    SET stock = stock + ?
                    WHERE id = ?
                    `,

                    [
                        quantity,

                        Number(
                            item.product_id
                        )

                    ]

                );


                // =========================================
                // REGISTRAR MOVIMIENTO
                // =========================================

                await connection.execute(

                    `
                    INSERT INTO inventory_movements (
                        product_id,
                        type,
                        quantity,
                        previous_stock,
                        new_stock,
                        reason,
                        order_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,

                    [
                        Number(
                            item.product_id
                        ),
                        "entrada",
                        quantity,
                        previousStock,
                        newStock,
                        `Pedido #${orderId} cancelado`,
                        orderId
                    ]

                );

            }

        }


        // =================================================
        // CANCELADO → ACTIVO
        // VOLVER A DESCONTAR STOCK
        // =================================================

        if (
            currentStatus === "cancelado" &&
            normalizedStatus !== "cancelado"
        ) {

            // =============================================
            // VALIDAR STOCK
            // =============================================

            for (
                const item
                of items
            ) {

                const quantity =
                    Number(
                        item.quantity
                    );


                const stock =
                    Number(
                        item.stock
                    );


                if (
                    stock < quantity
                ) {

                    throw new Error(

                        `No hay suficiente stock para ${item.brand} ${item.model}. Disponible: ${stock}. Necesario: ${quantity}.`

                    );

                }

            }


            // =============================================
            // DESCONTAR STOCK
            // =============================================

            for (
                const item
                of items
            ) {

                const quantity =
                    Number(
                        item.quantity
                    );


                const previousStock =
                    Number(
                        item.stock
                    );


                const newStock =
                    previousStock -
                    quantity;


                await connection.execute(

                    `
                    UPDATE products
                    SET stock = stock - ?
                    WHERE id = ?
                    `,

                    [
                        quantity,

                        Number(
                            item.product_id
                        )

                    ]

                );


                // =========================================
                // REGISTRAR MOVIMIENTO
                // =========================================

                await connection.execute(

                    `
                    INSERT INTO inventory_movements (
                        product_id,
                        type,
                        quantity,
                        previous_stock,
                        new_stock,
                        reason,
                        order_id
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    `,

                    [
                        Number(
                            item.product_id
                        ),
                        "salida",
                        quantity,
                        previousStock,
                        newStock,
                        `Pedido #${orderId} reactivado`,
                        orderId
                    ]

                );

            }

        }


        // =================================================
        // ACTUALIZAR ESTADO
        // =================================================

        await connection.execute(

            `
            UPDATE orders
            SET status = ?
            WHERE id = ?
            `,

            [
                normalizedStatus,
                orderId
            ]

        );


        // =================================================
        // REGISTRAR CAMBIO DE ESTADO
        // =================================================

        await connection.execute(

            `
            INSERT INTO order_status_history (
                order_id,
                previous_status,
                new_status
            )
            VALUES (?, ?, ?)
            `,

            [
                orderId,
                currentStatus,
                normalizedStatus
            ]

        );


        // =================================================
        // CONFIRMAR TRANSACCIÓN
        // =================================================

        await connection.commit();


        return res.json({

            success: true,

            message:
                "Estado del pedido actualizado correctamente.",

            orderId,

            previousStatus:
                currentStatus,

            status:
                normalizedStatus

        });


    } catch (error) {

        // =================================================
        // ROLLBACK
        // =================================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (
                rollbackError
            ) {

                console.error(
                    "Error haciendo rollback:",
                    rollbackError
                );

            }

        }


        console.error(
            "Error actualizando estado:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Error actualizando el estado del pedido."

        });

    } finally {

        if (connection) {

            connection.release();

        }

    }

};



// =====================================================
// OBTENER PEDIDOS DE UN CLIENTE
// =====================================================

const getCustomerOrders = async (
    req,
    res
) => {

    try {

        const email =
            String(
                req.query.email || ""
            )
                .trim()
                .toLowerCase();


        const phone =
            String(
                req.query.phone || ""
            )
                .trim();


        if (
            !email &&
            !phone
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Debe indicar el correo o teléfono del cliente."

            });

        }


        let query = `
            SELECT
                id,
                customer_name,
                customer_phone,
                customer_email,
                total,
                status,
                created_at
            FROM orders
            WHERE
        `;


        const params = [];


        if (
            email &&
            phone
        ) {

            query += `
                LOWER(customer_email) = ?
                AND customer_phone = ?
            `;


            params.push(
                email,
                phone
            );

        } else if (email) {

            query += `
                LOWER(customer_email) = ?
            `;


            params.push(
                email
            );

        } else {

            query += `
                customer_phone = ?
            `;


            params.push(
                phone
            );

        }


        query += `
            ORDER BY created_at DESC
        `;


        const [orders] =
            await db.execute(
                query,
                params
            );


        return res.json({

            success: true,

            orders,

            totalOrders:
                orders.length,

            totalPurchased:
                orders.reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        Number(
                            order.total || 0
                        ),
                    0
                )

        });


    } catch (error) {

        console.error(
            "Error obteniendo pedidos del cliente:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Error obteniendo los pedidos del cliente."

        });

    }

};



// =====================================================
// OBTENER CLIENTES
// =====================================================

const getCustomers = async (
    req,
    res
) => {

    try {

        const [customers] =
            await db.execute(

                `
                SELECT
                    customer_name,
                    customer_phone,
                    customer_email,
                    province,
                    city,
                    COUNT(*) AS total_pedidos,
                    SUM(total) AS total_comprado,
                    MAX(created_at) AS ultimo_pedido
                FROM orders
                GROUP BY
                    customer_name,
                    customer_phone,
                    customer_email,
                    province,
                    city
                ORDER BY
                    ultimo_pedido DESC
                `

            );


        return res.json({

            success: true,

            customers

        });


    } catch (error) {

        console.error(
            "Error obteniendo clientes:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Error obteniendo los clientes."

        });

    }

};


// =====================================================
// OBTENER MOVIMIENTOS DE INVENTARIO DE UN PRODUCTO
// =====================================================

const getInventoryMovements = async (
    req,
    res
) => {

    try {

        const productId =
            Number(
                req.params.productId
            );


        // =============================================
        // VALIDAR ID DEL PRODUCTO
        // =============================================

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID de producto inválido."

            });

        }


        // =============================================
        // OBTENER MOVIMIENTOS
        // =============================================

        const [movements] =
            await db.execute(

                `
                SELECT
                    im.id,
                    im.product_id,
                    im.type,
                    im.quantity,
                    im.previous_stock,
                    im.new_stock,
                    im.reason,
                    im.order_id,
                    im.created_at,
                    p.brand,
                    p.model
                FROM inventory_movements im
                INNER JOIN products p
                    ON p.id = im.product_id
                WHERE im.product_id = ?
                ORDER BY im.created_at DESC, im.id DESC
                `,

                [
                    productId
                ]

            );


        // =============================================
        // RESPUESTA
        // =============================================

        return res.json({

            success: true,

            movements

        });


    } catch (error) {

        console.error(
            "Error obteniendo movimientos de inventario:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Error obteniendo los movimientos de inventario."

        });

    }

};
// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    createOrder,

    getOrders,

    getOrderById,

    updateOrderStatus,

    getCustomerOrders,

    getCustomers,

    getInventoryMovements

};