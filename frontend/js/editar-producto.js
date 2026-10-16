const API_URL = "http://localhost:3000";

const token =
    localStorage.getItem("smartphoneToken");

const user =
    JSON.parse(
        localStorage.getItem("smartphoneUser")
    );


// ==========================================
// SEGURIDAD
// ==========================================

if (!token || !user || user.role !== "admin") {

    localStorage.clear();

    window.location.href =
        "../pages/login.html";
}


// ==========================================
// ID DEL PRODUCTO
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


if (!productId) {

    alert("No se especificó ningún producto.");

    window.location.href =
        "productos.html";
}


// ==========================================
// PERFIL
// ==========================================

document.getElementById(
    "sidebarName"
).textContent = user.name;

document.getElementById(
    "headerName"
).textContent = user.name;

const initial =
    user.name.charAt(0).toUpperCase();

document.getElementById(
    "profileAvatar"
).textContent = initial;

document.getElementById(
    "headerAvatar"
).textContent = initial;


// ==========================================
// ELEMENTOS
// ==========================================

const form =
    document.getElementById(
        "editProductForm"
    );

const imageInput =
    document.getElementById("image");

const imagePreview =
    document.getElementById(
        "imagePreview"
    );

const selectedFile =
    document.getElementById(
        "selectedFile"
    );

const message =
    document.getElementById(
        "formMessage"
    );

const updateBtn =
    document.getElementById(
        "updateProductBtn"
    );


// ==========================================
// CARGAR PRODUCTO
// ==========================================

async function loadProduct() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${productId}`
            );

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No se pudo cargar el producto."
            );

        }


        const product =
            data.product;


        document.getElementById(
            "brand"
        ).value =
            product.brand || "";


        document.getElementById(
            "model"
        ).value =
            product.model || "";


        document.getElementById(
            "description"
        ).value =
            product.description || "";


        document.getElementById(
            "price"
        ).value =
            product.price || "";


        document.getElementById(
            "oldPrice"
        ).value =
            product.old_price || "";


        document.getElementById(
            "stock"
        ).value =
            product.stock ?? 0;


        document.getElementById(
            "status"
        ).value =
            product.status || "active";


        document.getElementById(
            "ram"
        ).value =
            product.ram || "";


        document.getElementById(
            "storage"
        ).value =
            product.storage || "";


        document.getElementById(
            "color"
        ).value =
            product.color || "";


        document.getElementById(
            "category"
        ).value =
            product.category_id || "";


        document.getElementById(
            "isOffer"
        ).checked =
            Boolean(product.is_offer);


        document.getElementById(
            "isFeatured"
        ).checked =
            Boolean(product.is_featured);


        // Imagen actual

        if (product.image) {

            imagePreview.innerHTML = `

                <img
                    src="${API_URL}${product.image}"
                    alt="${product.model}"
                >

            `;

            selectedFile.textContent =
                "Imagen actual";

        } else {

            imagePreview.innerHTML = `

                <i class="fa-solid fa-mobile-screen"></i>

                <span>
                    Sin imagen
                </span>

            `;

            selectedFile.textContent =
                "No hay imagen";

        }


    } catch (error) {

        console.error(error);

        showMessage(
            error.message,
            "error"
        );

    }

}


// ==========================================
// PREVISUALIZAR NUEVA IMAGEN
// ==========================================

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];


        if (!file) {
            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            alert(
                "La imagen no puede superar los 5 MB."
            );

            imageInput.value = "";

            return;

        }


        selectedFile.textContent =
            file.name;


        const reader =
            new FileReader();


        reader.onload =
            (event) => {

                imagePreview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Vista previa"
                    >

                `;

            };


        reader.readAsDataURL(file);

    }
);


// ==========================================
// GUARDAR CAMBIOS
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const brand =
            document.getElementById(
                "brand"
            ).value.trim();


        const model =
            document.getElementById(
                "model"
            ).value.trim();


        const price =
            Number(
                document.getElementById(
                    "price"
                ).value
            );


        const stock =
            Number(
                document.getElementById(
                    "stock"
                ).value
            );


        if (!brand || !model) {

            showMessage(
                "Marca y modelo son obligatorios.",
                "error"
            );

            return;

        }


        if (!price || price <= 0) {

            showMessage(
                "El precio debe ser mayor que 0.",
                "error"
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "category_id",
            document.getElementById(
                "category"
            ).value
        );


        formData.append(
            "brand",
            brand
        );


        formData.append(
            "model",
            model
        );


        formData.append(
            "description",
            document.getElementById(
                "description"
            ).value.trim()
        );


        formData.append(
            "price",
            price
        );


        formData.append(
            "old_price",
            document.getElementById(
                "oldPrice"
            ).value
        );


        formData.append(
            "ram",
            document.getElementById(
                "ram"
            ).value
        );


        formData.append(
            "storage",
            document.getElementById(
                "storage"
            ).value
        );


        formData.append(
            "color",
            document.getElementById(
                "color"
            ).value.trim()
        );


        formData.append(
            "stock",
            stock
        );


        formData.append(
            "is_offer",
            document.getElementById(
                "isOffer"
            ).checked
        );


        formData.append(
            "is_featured",
            document.getElementById(
                "isFeatured"
            ).checked
        );


        formData.append(
            "status",
            document.getElementById(
                "status"
            ).value
        );


        // Solo enviamos imagen si seleccionó una nueva

        if (imageInput.files.length > 0) {

            formData.append(
                "image",
                imageInput.files[0]
            );

        }


        updateBtn.disabled = true;

        updateBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Guardando...

        `;


        try {

            const response =
                await fetch(
                    `${API_URL}/api/products/${productId}`,
                    {

                        method: "PUT",

                        headers: {

                            Authorization:
                                `Bearer ${token}`

                        },

                        body: formData

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "No se pudo actualizar."
                );

            }


            showMessage(
                "Producto actualizado correctamente.",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "productos.html";

                },
                1200
            );


        } catch (error) {

            console.error(error);

            showMessage(
                error.message,
                "error"
            );


            updateBtn.disabled = false;

            updateBtn.innerHTML = `

                <i class="fa-solid fa-floppy-disk"></i>

                Guardar cambios

            `;

        }

    }
);


// ==========================================
// MENSAJE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent = text;

    message.className =
        `form-message ${type}`;

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "smartphoneToken"
            );

            localStorage.removeItem(
                "smartphoneUser"
            );

            window.location.href =
                "../pages/login.html";

        }
    );


// ==========================================
// MENÚ MÓVIL
// ==========================================

document
    .getElementById("menuBtn")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("sidebar")
                .classList.toggle("open");

        }
    );


// ==========================================
// INICIAR
// ==========================================

loadProduct();