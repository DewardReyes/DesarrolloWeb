const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller");

const {
    verifyToken,
    adminOnly
} = require("../middleware/auth.middleware");


// ==========================================
// CONFIGURACIÓN DE MULTER
// ==========================================

const uploadDirectory =
    path.join(
        __dirname,
        "../uploads/products"
    );


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                uploadDirectory
            );

        },

        filename: (
            req,
            file,
            cb
        ) => {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const fileName =
                `product-${Date.now()}-${Math.round(Math.random() * 100000)}${extension}`;

            cb(
                null,
                fileName
            );

        }

    });


const fileFilter =
    (
        req,
        file,
        cb
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Solo se permiten imágenes JPG, JPEG, PNG o WEBP."
                ),
                false
            );

        }

    };


const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 * 1024 * 1024

        }

    });


// ==========================================
// PRODUCTOS PÚBLICOS
// ==========================================

router.get(
    "/",
    getProducts
);


router.get(
    "/:id",
    getProduct
);


// ==========================================
// PRODUCTOS ADMIN
// ==========================================

router.post(
    "/",
    verifyToken,
    adminOnly,
    upload.single("image"),
    createProduct
);


router.put(
    "/:id",
    verifyToken,
    adminOnly,
    upload.single("image"),
    updateProduct
);


router.delete(
    "/:id",
    verifyToken,
    adminOnly,
    deleteProduct
);


module.exports = router;