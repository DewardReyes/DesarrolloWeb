const db = require("../config/database");


// ==========================================
// OBTENER PRODUCTOS
// ==========================================

async function getProducts(req, res) {

    try {

        const [products] = await db.execute(`

            SELECT
                p.*,
                c.name AS category_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.id

            WHERE p.status = 'active'

            ORDER BY p.created_at DESC

        `);


        res.json({

            success: true,

            products

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Error obteniendo productos."

        });

    }

}


// ==========================================
// OBTENER UN PRODUCTO
// ==========================================

async function getProduct(req, res) {

    try {

        const { id } = req.params;


        const [products] =
            await db.execute(

                `SELECT
                    p.*,
                    c.name AS category_name

                 FROM products p

                 LEFT JOIN categories c
                    ON p.category_id = c.id

                 WHERE p.id = ?`,

                [id]

            );


        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Producto no encontrado."

            });

        }


        res.json({

            success: true,

            product: products[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Error obteniendo producto."

        });

    }

}


// ==========================================
// CREAR PRODUCTO
// ==========================================

async function createProduct(req, res) {

    try {

        const {
            category_id,
            brand,
            model,
            description,
            price,
            old_price,
            ram,
            storage,
            color,
            stock,
            is_offer,
            is_featured,
            status
        } = req.body;


        if (
            !brand ||
            !model ||
            price === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Marca, modelo y precio son obligatorios."

            });

        }


        let image = null;


        if (req.file) {

            image =
                `/uploads/products/${req.file.filename}`;

        }


        const [result] =
            await db.execute(

                `INSERT INTO products
                (
                    category_id,
                    brand,
                    model,
                    description,
                    price,
                    old_price,
                    ram,
                    storage,
                    color,
                    stock,
                    image,
                    is_offer,
                    is_featured,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                [
                    category_id || null,
                    brand,
                    model,
                    description || null,
                    price,
                    old_price || null,
                    ram || null,
                    storage || null,
                    color || null,
                    stock || 0,
                    image,
                    is_offer === "true" ||
                    is_offer === true
                        ? 1
                        : 0,
                    is_featured === "true" ||
                    is_featured === true
                        ? 1
                        : 0,
                    status || "active"
                ]

            );


        res.status(201).json({

            success: true,

            message:
                "Producto creado correctamente.",

            productId:
                result.insertId,

            image

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Error creando producto."

        });

    }

}

// ==========================================
// ACTUALIZAR PRODUCTO
// ==========================================

async function updateProduct(req, res) {

    try {

        const { id } = req.params;


        // ==================================
        // BUSCAR PRODUCTO ACTUAL
        // ==================================

        const [products] =
            await db.execute(

                `
                SELECT
                    category_id,
                    brand,
                    model,
                    description,
                    price,
                    old_price,
                    ram,
                    storage,
                    color,
                    stock,
                    image,
                    is_offer,
                    is_featured,
                    status
                FROM products
                WHERE id = ?
                `,

                [id]

            );


        if (products.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Producto no encontrado."

            });

        }


        // ==================================
        // PRODUCTO ACTUAL
        // ==================================

        const currentProduct =
            products[0];


        // ==================================
        // DATOS RECIBIDOS
        // ==================================

        const body =
            req.body || {};


        // ==================================
        // FUNCIÓN BOOLEAN
        // ==================================

        function parseBoolean(
            value,
            defaultValue
        ) {

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                return defaultValue;

            }


            if (
                value === true ||
                value === 1 ||
                value === "1" ||
                value === "true"
            ) {

                return 1;

            }


            if (
                value === false ||
                value === 0 ||
                value === "0" ||
                value === "false"
            ) {

                return 0;

            }


            return defaultValue;

        }


        // ==================================
        // CONSERVAR DATOS ACTUALES
        // ==================================

        const category_id =
            body.category_id !== undefined
                ? (
                    body.category_id === "" ||
                    body.category_id === null
                        ? null
                        : body.category_id
                )
                : currentProduct.category_id;


        const brand =
            body.brand !== undefined
                ? body.brand
                : currentProduct.brand;


        const model =
            body.model !== undefined
                ? body.model
                : currentProduct.model;


        const description =
            body.description !== undefined
                ? (
                    body.description === ""
                        ? null
                        : body.description
                )
                : currentProduct.description;


        const price =
            body.price !== undefined
                ? Number(body.price)
                : Number(currentProduct.price);


        const old_price =
            body.old_price !== undefined
                ? (
                    body.old_price === "" ||
                    body.old_price === null
                        ? null
                        : Number(body.old_price)
                )
                : currentProduct.old_price;


        const ram =
            body.ram !== undefined
                ? (
                    body.ram === ""
                        ? null
                        : body.ram
                )
                : currentProduct.ram;


        const storage =
            body.storage !== undefined
                ? (
                    body.storage === ""
                        ? null
                        : body.storage
                )
                : currentProduct.storage;


        const color =
            body.color !== undefined
                ? (
                    body.color === ""
                        ? null
                        : body.color
                )
                : currentProduct.color;


        const stock =
            body.stock !== undefined
                ? Number(body.stock)
                : Number(currentProduct.stock);


        const image =
            req.file
                ? `/uploads/products/${req.file.filename}`
                : currentProduct.image;


        const is_offer =
            parseBoolean(
                body.is_offer,
                Number(
                    currentProduct.is_offer
                )
            );


        const is_featured =
            parseBoolean(
                body.is_featured,
                Number(
                    currentProduct.is_featured
                )
            );


        const status =
            body.status !== undefined
                ? body.status
                : currentProduct.status;


        // ==================================
        // VALIDACIONES
        // ==================================

        if (
            !brand ||
            String(brand).trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "La marca es obligatoria."

            });

        }


        if (
            !model ||
            String(model).trim() === ""
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El modelo es obligatorio."

            });

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El precio no es válido."

            });

        }


        if (
            !Number.isFinite(stock) ||
            stock < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El stock no es válido."

            });

        }


        // ==================================
        // VALIDAR ESTADO
        // ==================================

        const validStatuses = [
            "active",
            "inactive"
        ];


        if (
            !validStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El estado del producto no es válido."

            });

        }


        // ==================================
        // VALIDAR PRECIO ANTERIOR
        // ==================================

        if (
            old_price !== null &&
            (
                !Number.isFinite(
                    Number(old_price)
                ) ||
                Number(old_price) < 0
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "El precio anterior no es válido."

            });

        }


        // ==================================
        // ACTUALIZAR PRODUCTO
        // ==================================

        const [result] =
            await db.execute(

                `
                UPDATE products

                SET

                    category_id = ?,

                    brand = ?,

                    model = ?,

                    description = ?,

                    price = ?,

                    old_price = ?,

                    ram = ?,

                    storage = ?,

                    color = ?,

                    stock = ?,

                    image = ?,

                    is_offer = ?,

                    is_featured = ?,

                    status = ?

                WHERE id = ?
                `,

                [

                    category_id,

                    brand,

                    model,

                    description,

                    price,

                    old_price,

                    ram,

                    storage,

                    color,

                    stock,

                    image,

                    is_offer,

                    is_featured,

                    status,

                    id

                ]

            );


        // ==================================
        // RESPUESTA
        // ==================================

        return res.json({

            success: true,

            message:
                "Producto actualizado correctamente.",

            product: {

                id: Number(id),

                category_id,

                brand,

                model,

                description,

                price,

                old_price,

                ram,

                storage,

                color,

                stock,

                image,

                is_offer,

                is_featured,

                status

            }

        });


    } catch (error) {

        console.error(
            "Error actualizando producto:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Error actualizando producto."

        });

    }

}

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

async function deleteProduct(req, res) {

    try {

        const { id } = req.params;


        const [result] =
            await db.execute(

                `DELETE FROM products
                 WHERE id = ?`,

                [id]

            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Producto no encontrado."

            });

        }


        res.json({

            success: true,

            message:
                "Producto eliminado correctamente."

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Error eliminando producto."

        });

    }

}


module.exports = {

    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct

};