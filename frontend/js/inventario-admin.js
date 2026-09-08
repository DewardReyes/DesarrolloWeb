const API_URL = "http://localhost:3000";


// =====================================================
// VERIFICAR SESIÓN
// =====================================================

const token =
    localStorage.getItem("smartphoneToken");

const userData =
    localStorage.getItem("smartphoneUser");

let user = null;


try {

    user = userData
        ? JSON.parse(userData)
        : null;

} catch (error) {

    user = null;

}


if (!token || !user) {

    window.location.href =
        "../pages/login.html";

    throw new Error(
        "Sesión no válida."
    );

}


// =====================================================
// VERIFICAR ADMIN
// =====================================================

if (user.role !== "admin") {

    localStorage.removeItem(
        "smartphoneToken"
    );

    localStorage.removeItem(
        "smartphoneUser"
    );

    window.location.href =
        "../pages/login.html";

    throw new Error(
        "Acceso no autorizado."
    );

}


// =====================================================
// ELEMENTOS
// =====================================================

const inventoryTableBody =
    document.getElementById(
        "inventoryTableBody"
    );


const totalProductsElement =
    document.getElementById(
        "totalProducts"
    );


const totalStockElement =
    document.getElementById(
        "totalStock"
    );


const lowStockElement =
    document.getElementById(
        "lowStock"
    );


const outOfStockElement =
    document.getElementById(
        "outOfStock"
    );


const inventorySearch =
    document.getElementById(
        "inventorySearch"
    );


const globalSearch =
    document.getElementById(
        "globalSearch"
    );


const stockFilter =
    document.getElementById(
        "stockFilter"
    );


const productsCount =
    document.getElementById(
        "productsCount"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const sidebar =
    document.getElementById(
        "sidebar"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const sidebarName =
    document.getElementById(
        "sidebarName"
    );


const headerName =
    document.getElementById(
        "headerName"
    );


const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );


const headerAvatar =
    document.getElementById(
        "headerAvatar"
    );


// =====================================================
// VARIABLES
// =====================================================

let products = [];


// =====================================================
// CONFIGURACIÓN
// =====================================================

/*
    Cantidad considerada como STOCK BAJO.

    5 = cualquier producto con 5 o menos
    será considerado stock bajo.
*/

const LOW_STOCK_LIMIT = 5;


// =====================================================
// INFORMACIÓN DEL ADMINISTRADOR
// =====================================================

if (user) {

    const name =
        user.name ||
        "Administrador";


    if (sidebarName) {

        sidebarName.textContent =
            name;

    }


    if (headerName) {

        headerName.textContent =
            name;

    }


    const initial =
        name
            .charAt(0)
            .toUpperCase();


    if (profileAvatar) {

        profileAvatar.textContent =
            initial;

    }


    if (headerAvatar) {

        headerAvatar.textContent =
            initial;

    }

}


// =====================================================
// FORMATO DE MONEDA
// =====================================================

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "es-DO",
        {
            style: "currency",
            currency: "DOP",
            maximumFractionDigits: 0
        }
    ).format(
        Number(value || 0)
    );

}


// =====================================================
// FORMATO DE FECHA
// =====================================================

function formatDate(value) {

    if (!value) {

        return "Sin fecha";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Sin fecha";

    }


    return new Intl.DateTimeFormat(
        "es-DO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// OBTENER PRODUCTOS
// =====================================================

async function loadProducts() {

    try {

        inventoryTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-loading"
                >

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    Cargando inventario...

                </td>

            </tr>

        `;


        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudieron obtener los productos."

            );

        }


        products =
            data.products || [];


        updateStatistics();


        renderProducts(
            products
        );


    } catch (error) {

        console.error(
            "Error cargando inventario:",
            error
        );


        inventoryTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-error"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    No se pudo cargar el inventario.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// OBTENER STOCK
// =====================================================

function getStock(product) {

    return Number(
        product.stock || 0
    );

}


// =====================================================
// DETERMINAR ESTADO
// =====================================================

function getStockStatus(
    stock
) {

    if (stock <= 0) {

        return "out";

    }


    if (
        stock <= LOW_STOCK_LIMIT
    ) {

        return "low";

    }


    return "available";

}


// =====================================================
// TEXTO DEL ESTADO
// =====================================================

function getStockStatusText(
    status
) {

    const statuses = {

        available:
            "Disponible",

        low:
            "Stock bajo",

        out:
            "Agotado"

    };


    return (
        statuses[status] ||
        "Desconocido"
    );

}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function updateStatistics() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (
                total,
                product
            ) => {

                return total +
                    getStock(product);

            },
            0
        );


    const lowStock =
        products.filter(
            product => {

                const stock =
                    getStock(product);


                return (
                    stock > 0 &&
                    stock <= LOW_STOCK_LIMIT
                );

            }
        ).length;


    const outOfStock =
        products.filter(
            product => {

                return (
                    getStock(product) <= 0
                );

            }
        ).length;


    if (totalProductsElement) {

        totalProductsElement.textContent =
            totalProducts;

    }


    if (totalStockElement) {

        totalStockElement.textContent =
            totalStock;

    }


    if (lowStockElement) {

        lowStockElement.textContent =
            lowStock;

    }


    if (outOfStockElement) {

        outOfStockElement.textContent =
            outOfStock;

    }


    updateProductsCount(
        products.length
    );

}


// =====================================================
// CONTADOR
// =====================================================

function updateProductsCount(
    amount
) {

    if (!productsCount) {

        return;

    }


    productsCount.textContent =

        `${amount} ${
            amount === 1
                ? "producto"
                : "productos"
        }`;

}


// =====================================================
// OBTENER IMAGEN
// =====================================================

function getProductImage(
    product
) {

    return (

        product.image ||
        product.image_url ||
        product.photo ||
        product.photo_url ||
        ""

    );

}


// =====================================================
// CREAR IMAGEN DEL PRODUCTO
// =====================================================

function createProductImage(
    product
) {

    const image =
        getProductImage(
            product
        );


    if (!image) {

        return `

            <div
                class="inventory-product-image"
            >

                <i
                    class="fa-solid fa-mobile-screen"
                ></i>

            </div>

        `;

    }


    let imageURL =
        image;


    if (
        image.startsWith("/")
    ) {

        imageURL =
            `${API_URL}${image}`;

    }


    return `

        <div
            class="inventory-product-image"
        >

            <img
                src="${escapeHTML(imageURL)}"
                alt="Producto"
                onerror="
                    this.style.display='none';
                    this.parentElement.innerHTML='<i class=&quot;fa-solid fa-mobile-screen&quot;></i>';
                "
            >

        </div>

    `;

}


// =====================================================
// CREAR FILA
// =====================================================

function createProductRow(
    product
) {

    const id =
        product.id;


    const brand =
        product.brand ||
        "Sin marca";


    const model =
        product.model ||
        "Sin modelo";


    const price =
        Number(
            product.price || 0
        );


    const stock =
        getStock(product);


    const status =
        getStockStatus(
            stock
        );


    const statusText =
        getStockStatusText(
            status
        );


    const updateDate =
        product.updated_at ||
        product.created_at ||
        null;


    return `

        <tr>

            <!-- PRODUCTO -->

            <td>

                <div
                    class="inventory-product"
                >

                    ${createProductImage(
                        product
                    )}

                    <div
                        class="inventory-product-info"
                    >

                        <span
                            class="inventory-product-name"
                        >

                            ${escapeHTML(
                                brand
                            )}

                            ${escapeHTML(
                                model
                            )}

                        </span>


                        <span
                            class="inventory-product-id"
                        >

                            ID:
                            ${escapeHTML(
                                id
                            )}

                        </span>

                    </div>

                </div>

            </td>


            <!-- PRECIO -->

            <td>

                <span
                    class="inventory-price"
                >

                    ${formatCurrency(
                        price
                    )}

                </span>

            </td>


            <!-- STOCK -->

            <td>

                <span
                    class="
                        stock-value
                        ${status}
                    "
                >

                    ${stock}

                </span>

            </td>


            <!-- ESTADO -->

            <td>

                <span
                    class="
                        stock-status
                        ${status}
                    "
                >

                    ${statusText}

                </span>

            </td>


            <!-- FECHA -->

            <td>

                <span
                    class="inventory-date"
                >

                    ${formatDate(
                        updateDate
                    )}

                </span>

            </td>


            <!-- ACCIONES -->

            <td>

                <button
                    type="button"
                    class="inventory-movements-btn"
                    data-product-id="${escapeHTML(id)}"
                    data-product-name="${escapeHTML(
                        `${brand} ${model}`
                    )}"
                >

                    <i
                        class="fa-solid fa-clock-rotate-left"
                    ></i>

                    Movimientos

                </button>

            </td>

        </tr>

    `;

}


// =====================================================
// MOSTRAR PRODUCTOS
// =====================================================

function renderProducts(
    productsToRender
) {

    if (
        !productsToRender.length
    ) {

        inventoryTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-box-open"
                    ></i>

                    No hay productos para mostrar.

                </td>

            </tr>

        `;


        updateProductsCount(
            0
        );

        return;

    }


    inventoryTableBody.innerHTML =
        productsToRender
            .map(
                product =>
                    createProductRow(
                        product
                    )
            )
            .join("");


    updateProductsCount(
        productsToRender.length
    );

}


// =====================================================
// FILTRAR PRODUCTOS
// =====================================================

function filterProducts() {

    const search =
        String(
            inventorySearch?.value || ""
        )
            .trim()
            .toLowerCase();


    const selectedFilter =
        stockFilter?.value ||
        "all";


    const filtered =
        products.filter(
            product => {

                const brand =
                    String(
                        product.brand || ""
                    )
                        .toLowerCase();


                const model =
                    String(
                        product.model || ""
                    )
                        .toLowerCase();


                const id =
                    String(
                        product.id || ""
                    )
                        .toLowerCase();


                const matchesSearch =

                    !search ||

                    brand.includes(
                        search
                    ) ||

                    model.includes(
                        search
                    ) ||

                    id.includes(
                        search
                    );


                if (!matchesSearch) {

                    return false;

                }


                const stock =
                    getStock(product);


                const status =
                    getStockStatus(
                        stock
                    );


                if (
                    selectedFilter ===
                    "all"
                ) {

                    return true;

                }


                if (
                    selectedFilter ===
                    "available"
                ) {

                    return (
                        status ===
                        "available"
                    );

                }


                if (
                    selectedFilter ===
                    "low"
                ) {

                    return (
                        status ===
                        "low"
                    );

                }


                if (
                    selectedFilter ===
                    "out"
                ) {

                    return (
                        status ===
                        "out"
                    );

                }


                return true;

            }
        );


    renderProducts(
        filtered
    );

}


// =====================================================
// BUSCADOR
// =====================================================

if (inventorySearch) {

    inventorySearch.addEventListener(
        "input",
        filterProducts
    );

}


// =====================================================
// FILTRO
// =====================================================

if (stockFilter) {

    stockFilter.addEventListener(
        "change",
        filterProducts
    );

}


// =====================================================
// BUSCADOR GENERAL
// =====================================================

if (globalSearch) {

    globalSearch.addEventListener(
        "input",
        () => {

            if (inventorySearch) {

                inventorySearch.value =
                    globalSearch.value;

            }


            filterProducts();

        }
    );

}


// =====================================================
// MENÚ MÓVIL
// =====================================================

if (
    menuBtn &&
    sidebar
) {

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// =====================================================
// MODAL DE MOVIMIENTOS
// =====================================================

let movementsModal = null;


// =====================================================
// CREAR MODAL
// =====================================================

function createMovementsModal() {

    if (movementsModal) {

        return movementsModal;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "inventoryMovementsModal";


    modal.className =
        "inventory-movements-modal";


    modal.innerHTML = `

        <div
            class="inventory-movements-overlay"
        ></div>


        <div
            class="inventory-movements-content"
        >

            <div
                class="inventory-movements-header"
            >

                <div>

                    <span
                        class="inventory-movements-label"
                    >

                        HISTORIAL

                    </span>


                    <h2
                        id="movementsModalTitle"
                    >

                        Movimientos de inventario

                    </h2>

                </div>


                <button
                    type="button"
                    class="inventory-movements-close"
                    id="closeMovementsModal"
                    aria-label="Cerrar"
                >

                    <i
                        class="fa-solid fa-xmark"
                    ></i>

                </button>

            </div>


            <div
                id="movementsModalBody"
                class="inventory-movements-body"
            >

                <div
                    class="inventory-movements-loading"
                >

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    Cargando movimientos...

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    movementsModal =
        modal;


    const closeButton =
        document.getElementById(
            "closeMovementsModal"
        );


    const overlay =
        modal.querySelector(
            ".inventory-movements-overlay"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMovementsModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMovementsModal
        );

    }


    return modal;

}


// =====================================================
// ABRIR MODAL
// =====================================================

async function openMovementsModal(
    productId,
    productName
) {

    const modal =
        createMovementsModal();


    const title =
        document.getElementById(
            "movementsModalTitle"
        );


    const body =
        document.getElementById(
            "movementsModalBody"
        );


    if (title) {

        title.textContent =
            `Movimientos — ${productName}`;

    }


    if (body) {

        body.innerHTML = `

            <div
                class="inventory-movements-loading"
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Cargando movimientos...

            </div>

        `;

    }


    modal.classList.add(
        "open"
    );


    document.body.classList.add(
        "modal-open"
    );


    try {

        const response =
            await fetch(

                `${API_URL}/api/orders/inventory-movements/${encodeURIComponent(
                    productId
                )}`

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudieron obtener los movimientos."

            );

        }


        const movements =
            data.movements || [];


        renderInventoryMovements(
            movements
        );


    } catch (error) {

        console.error(
            "Error obteniendo movimientos:",
            error
        );


        if (body) {

            body.innerHTML = `

                <div
                    class="inventory-movements-empty"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    <strong>
                        No se pudieron cargar los movimientos.
                    </strong>

                    <span>
                        Intenta nuevamente.
                    </span>

                </div>

            `;

        }

    }

}


// =====================================================
// MOSTRAR MOVIMIENTOS
// =====================================================

function renderInventoryMovements(
    movements
) {

    const body =
        document.getElementById(
            "movementsModalBody"
        );


    if (!body) {

        return;

    }


    if (
        !movements.length
    ) {

        body.innerHTML = `

            <div
                class="inventory-movements-empty"
            >

                <i
                    class="fa-solid fa-box-open"
                ></i>

                <strong>
                    Este producto todavía no tiene movimientos.
                </strong>

                <span>
                    Los movimientos aparecerán aquí cuando exista una entrada, salida o ajuste.
                </span>

            </div>

        `;

        return;

    }


    body.innerHTML =
        movements
            .map(
                movement =>
                    createMovementItem(
                        movement
                    )
            )
            .join("");

}


// =====================================================
// CREAR MOVIMIENTO
// =====================================================

function createMovementItem(
    movement
) {

    const type =
        String(
            movement.type || ""
        )
            .trim()
            .toLowerCase();


    let typeText =
        "Movimiento";


    let icon =
        "fa-arrows-rotate";


    if (
        type === "entrada"
    ) {

        typeText =
            "Entrada";

        icon =
            "fa-arrow-down";

    }


    if (
        type === "salida"
    ) {

        typeText =
            "Salida";

        icon =
            "fa-arrow-up";

    }


    if (
        type === "ajuste"
    ) {

        typeText =
            "Ajuste";

        icon =
            "fa-sliders";

    }


    const quantity =
        Number(
            movement.quantity || 0
        );


    const previousStock =
        Number(
            movement.previous_stock || 0
        );


    const newStock =
        Number(
            movement.new_stock || 0
        );


    const reason =
        movement.reason ||
        "Sin motivo indicado";


    const orderId =
        movement.order_id;


    return `

        <article
            class="
                inventory-movement-item
                ${escapeHTML(type)}
            "
        >

            <div
                class="inventory-movement-icon"
            >

                <i
                    class="
                        fa-solid
                        ${icon}
                    "
                ></i>

            </div>


            <div
                class="inventory-movement-main"
            >

                <div
                    class="inventory-movement-top"
                >

                    <strong>

                        ${escapeHTML(
                            typeText
                        )}

                    </strong>


                    <span>

                        ${formatDateTime(
                            movement.created_at
                        )}

                    </span>

                </div>


                <div
                    class="inventory-movement-stock"
                >

                    <span>

                        Stock anterior:
                        <strong>
                            ${previousStock}
                        </strong>

                    </span>


                    <span>

                        Stock nuevo:
                        <strong>
                            ${newStock}
                        </strong>

                    </span>


                    <span>

                        Cantidad:
                        <strong>
                            ${quantity}
                        </strong>

                    </span>

                </div>


                <div
                    class="inventory-movement-reason"
                >

                    ${escapeHTML(
                        reason
                    )}

                </div>


                ${
                    orderId
                        ? `
                            <button
                                type="button"
                                class="inventory-movement-order"
                                data-order-id="${escapeHTML(
                                    orderId
                                )}"
                            >

                                <i
                                    class="fa-solid fa-receipt"
                                ></i>

                                Pedido #${escapeHTML(
                                    orderId
                                )}

                            </button>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


// =====================================================
// FORMATO FECHA Y HORA
// =====================================================

function formatDateTime(
    value
) {

    if (!value) {

        return "Sin fecha";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Sin fecha";

    }


    return new Intl.DateTimeFormat(
        "es-DO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


// =====================================================
// CERRAR MODAL
// =====================================================

function closeMovementsModal() {

    if (!movementsModal) {

        return;

    }


    movementsModal.classList.remove(
        "open"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


// =====================================================
// CLIC EN MOVIMIENTOS
// =====================================================

document.addEventListener(
    "click",
    event => {


        // =================================================
        // ABRIR MOVIMIENTOS
        // =================================================

        const movementsButton =
            event.target.closest(
                ".inventory-movements-btn"
            );


        if (movementsButton) {

            const productId =
                movementsButton.dataset.productId;


            const productName =
                movementsButton.dataset.productName ||
                "Producto";


            if (!productId) {

                return;

            }


            openMovementsModal(
                productId,
                productName
            );


            return;

        }



        // =================================================
        // VER PEDIDO DESDE MOVIMIENTO
        // =================================================

        const orderButton =
            event.target.closest(
                ".inventory-movement-order"
            );


        if (orderButton) {

            event.preventDefault();


            const orderId =
                orderButton.dataset.orderId;


            console.log(
                "Pedido seleccionado desde inventario:",
                orderId
            );


            if (!orderId) {

                console.error(
                    "No se encontró el ID del pedido."
                );

                return;

            }


            const orderUrl =
                new URL(
                    "pedidos.html",
                    window.location.href
                );


            orderUrl.searchParams.set(
                "order",
                orderId
            );


            console.log(
                "Abriendo pedido:",
                orderUrl.href
            );


            window.location.assign(
                orderUrl.href
            );


            return;

        }

    }
);

// =====================================================
// ESC PARA CERRAR MODAL
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeMovementsModal();

        }

    }
);


// =====================================================
// CERRAR SESIÓN
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "¿Quieres cerrar sesión?"
                );


            if (!confirmLogout) {

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

}


// =====================================================
// INICIAR
// =====================================================

loadProducts();