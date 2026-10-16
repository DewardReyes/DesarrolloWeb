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
// VARIABLES
// ==========================================

let allProducts = [];


// ==========================================
// ELEMENTOS
// ==========================================

const tableBody =
    document.getElementById(
        "productsTableBody"
    );

const emptyProducts =
    document.getElementById(
        "emptyProducts"
    );

const productCount =
    document.getElementById(
        "productCount"
    );

const productSearch =
    document.getElementById(
        "productSearch"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


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
// FORMATO DE PRECIO
// ==========================================

function formatPrice(price) {

    return new Intl.NumberFormat(
        "es-DO",
        {
            style: "currency",
            currency: "DOP",
            maximumFractionDigits: 0
        }
    ).format(price);

}


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function loadProducts() {

    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="table-loading"
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Cargando productos...

            </td>

        </tr>

    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Error obteniendo productos."
            );

        }


        allProducts =
            data.products || [];


        applyFilters();


    } catch (error) {

        console.error(error);


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="table-loading"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    Error cargando productos.

                </td>

            </tr>

        `;

    }

}


// ==========================================
// FILTROS
// ==========================================

function applyFilters() {

    const search =
        productSearch.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const status =
        statusFilter.value;


    const filtered =
        allProducts.filter(product => {


            const fullName =
                `${product.brand} ${product.model}`
                    .toLowerCase();


            const matchesSearch =
                !search ||
                fullName.includes(search);


            const matchesCategory =
                !category ||
                product.category_name === category;


            const matchesStatus =
                !status ||
                product.status === status;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    renderProducts(filtered);

}


// ==========================================
// MOSTRAR PRODUCTOS
// ==========================================

function renderProducts(products) {

    productCount.textContent =
        `${products.length} ${
            products.length === 1
                ? "producto"
                : "productos"
        }`;


    if (products.length === 0) {

        tableBody.innerHTML = "";

        emptyProducts.style.display =
            "block";

        return;

    }


    emptyProducts.style.display =
        "none";


    tableBody.innerHTML =
        products.map(product => {

            const stock =
                Number(product.stock || 0);


            let stockClass =
                "stock-normal";


            if (stock === 0) {

                stockClass =
                    "stock-empty";

            } else if (stock <= 5) {

                stockClass =
                    "stock-low";

            }


            const statusClass =
                product.status === "active"
                    ? "status-active"
                    : "status-inactive";


            const statusText =
                product.status === "active"
                    ? "Activo"
                    : "Inactivo";


            const offerClass =
                product.is_offer
                    ? "offer-yes"
                    : "offer-no";


            const offerText =
                product.is_offer
                    ? "Sí"
                    : "No";


            const image =
                product.image
                    ? `
                        <img
                            src="${escapeHTML(
                                product.image
                            )}"
                            alt="${escapeHTML(
                                product.model
                            )}"
                        >
                    `
                    : `
                        <i
                            class="fa-solid fa-mobile-screen"
                        ></i>
                    `;


            return `

                <tr>


                    <!-- PRODUCTO -->

                    <td>

                        <div
                            class="product-table-info"
                        >

                            <div
                                class="product-table-image"
                            >

                                ${image}

                            </div>


                            <div
                                class="product-table-name"
                            >

                                <strong>

                                    ${escapeHTML(
                                        product.model
                                    )}

                                </strong>

                                <span>

                                    ${escapeHTML(
                                        product.storage ||
                                        "Sin almacenamiento"
                                    )}

                                </span>

                            </div>

                        </div>

                    </td>


                    <!-- MARCA -->

                    <td>

                        ${escapeHTML(
                            product.brand
                        )}

                    </td>


                    <!-- PRECIO -->

                    <td>

                        <div
                            class="product-price-cell"
                        >

                            ${formatPrice(
                                product.price
                            )}

                        </div>


                        ${
                            product.old_price
                                ? `
                                    <span
                                        class="old-price"
                                    >
                                        ${formatPrice(
                                            product.old_price
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </td>


                    <!-- STOCK -->

                    <td>

                        <span
                            class="${stockClass}"
                        >

                            ${stock}

                        </span>

                    </td>


                    <!-- ESTADO -->

                    <td>

                        <span
                            class="status-badge ${statusClass}"
                        >

                            ${statusText}

                        </span>

                    </td>


                    <!-- OFERTA -->

                    <td>

                        <span
                            class="offer-badge ${offerClass}"
                        >

                            ${offerText}

                        </span>

                    </td>


                    <!-- ACCIONES -->

                    <td>

                        <div
                            class="table-actions"
                        >

                            <button
                                class="table-action edit"
                                onclick="editProduct(${product.id})"
                                title="Editar"
                            >

                                <i
                                    class="fa-solid fa-pen"
                                ></i>

                            </button>


                            <button
                                class="table-action delete"
                                onclick="deleteProduct(${product.id})"
                                title="Eliminar"
                            >

                                <i
                                    class="fa-solid fa-trash"
                                ></i>

                            </button>

                        </div>

                    </td>


                </tr>

            `;

        }).join("");

}


// ==========================================
// EDITAR
// ==========================================

function editProduct(id) {

    window.location.href =
        `editar-producto.html?id=${id}`;

}


// ==========================================
// ELIMINAR
// ==========================================

async function deleteProduct(id) {

    const product =
        allProducts.find(
            item => item.id === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `¿Quieres eliminar "${product.brand} ${product.model}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/products/${id}`,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No se pudo eliminar."
            );

        }


        alert(
            "Producto eliminado correctamente."
        );


        loadProducts();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Error eliminando producto."
        );

    }

}


// ==========================================
// SEGURIDAD HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// EVENTOS
// ==========================================

productSearch.addEventListener(
    "input",
    applyFilters
);


categoryFilter.addEventListener(
    "change",
    applyFilters
);


statusFilter.addEventListener(
    "change",
    applyFilters
);


document
    .getElementById("refreshProducts")
    .addEventListener(
        "click",
        loadProducts
    );


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
                .classList.toggle("open");

        }
    );


// ==========================================
// INICIAR
// ==========================================

loadProducts();