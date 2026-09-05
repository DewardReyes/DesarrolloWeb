const API_URL = "http://localhost:3000";


// ==========================================
// SESIÓN
// ==========================================

const token =
    localStorage.getItem("smartphoneToken");

const user =
    JSON.parse(
        localStorage.getItem("smartphoneUser")
    );


if (!token || !user) {

    window.location.href =
        "../pages/login.html";

}


if (user && user.role !== "admin") {

    localStorage.clear();

    window.location.href =
        "../pages/login.html";

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
    user.name
        .charAt(0)
        .toUpperCase();


document.getElementById(
    "profileAvatar"
).textContent = initial;


document.getElementById(
    "headerAvatar"
).textContent = initial;


// ==========================================
// FORMULARIO
// ==========================================

const productForm =
    document.getElementById(
        "productForm"
    );

const saveProductBtn =
    document.getElementById(
        "saveProductBtn"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


// ==========================================
// GUARDAR PRODUCTO
// ==========================================

productForm.addEventListener(
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


        // ==================================
        // VALIDACIONES
        // ==================================

        if (!brand || !model) {

            showMessage(
                "La marca y el modelo son obligatorios.",
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


        if (stock < 0) {

            showMessage(
                "El stock no puede ser negativo.",
                "error"
            );

            return;

        }


        // ==================================
        // CREAR FORMDATA
        // ==================================

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


        // ==================================
        // IMAGEN
        // ==================================

        const imageInput =
            document.getElementById(
                "image"
            );


        if (imageInput.files.length > 0) {

            formData.append(
                "image",
                imageInput.files[0]
            );

        }


        // ==================================
        // BOTÓN
        // ==================================

        saveProductBtn.disabled =
            true;


        saveProductBtn.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            Guardando...

        `;


        // ==================================
        // ENVIAR
        // ==================================

        try {

            const response =
                await fetch(
                    `${API_URL}/api/products`,
                    {

                        method: "POST",

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
                    "No se pudo guardar el producto."
                );

            }


            showMessage(
                "Producto creado correctamente.",
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
                error.message ||
                "Error conectando con el servidor.",
                "error"
            );


            saveProductBtn.disabled =
                false;


            saveProductBtn.innerHTML = `

                <i
                    class="fa-solid fa-floppy-disk"
                ></i>

                Guardar producto

            `;

        }

    }
);

// ==========================================
// MENSAJE
// ==========================================

function showMessage(
    message,
    type
) {

    formMessage.textContent =
        message;

    formMessage.className =
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

            if (
                !confirm(
                    "¿Quieres cerrar sesión?"
                )
            ) {

                return;

            }


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
                .classList.toggle(
                    "open"
                );

        }
    );

    // ==========================================
// PREVISUALIZAR IMAGEN
// ==========================================

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


imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];


        if (!file) {

            selectedFile.textContent =
                "Ningún archivo seleccionado";

            imagePreview.innerHTML = `

                <i
                    class="fa-solid fa-mobile-screen"
                ></i>

                <span>
                    Vista previa
                </span>

            `;

            return;

        }


        // Verificar tamaño

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