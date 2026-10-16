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
// VERIFICAR ADMINISTRADOR
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


const ordersTableBody =
    document.getElementById(
        "ordersTableBody"
    );


const totalOrders =
    document.getElementById(
        "totalOrders"
    );


const pendingOrders =
    document.getElementById(
        "pendingOrders"
    );


const confirmedOrders =
    document.getElementById(
        "confirmedOrders"
    );


const deliveredOrders =
    document.getElementById(
        "deliveredOrders"
    );


const orderSearch =
    document.getElementById(
        "orderSearch"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
    );


const globalSearch =
    document.getElementById(
        "globalSearch"
    );


const orderModal =
    document.getElementById(
        "orderModal"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


const modalTitle =
    document.getElementById(
        "modalTitle"
    );


const modalBody =
    document.getElementById(
        "modalBody"
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


// =====================================================
// VARIABLES
// =====================================================

let orders = [];

let currentOrder = null;


// =====================================================
// INFORMACIÓN DEL ADMINISTRADOR
// =====================================================

if (user) {

    const name =
        user.name || "Administrador";


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

function formatDate(dateValue) {

    if (!dateValue) {

        return "Sin fecha";

    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {

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
// ALERTA PERSONALIZADA
// =====================================================

function showCustomAlert(
    message,
    type = "success",
    title = ""
) {

    let overlay =
        document.getElementById(
            "customOrderAlert"
        );


    // Crear alerta si todavía no existe
    if (!overlay) {

        overlay =
            document.createElement("div");

        overlay.id =
            "customOrderAlert";

        overlay.className =
            "custom-order-alert-overlay";


        overlay.innerHTML = `

            <div class="custom-order-alert">

                <div
                    id="customOrderAlertIcon"
                    class="custom-order-alert-icon"
                ></div>


                <h3
                    id="customOrderAlertTitle"
                ></h3>


                <p
                    id="customOrderAlertMessage"
                ></p>


                <button
                    type="button"
                    id="customOrderAlertButton"
                    class="custom-order-alert-button"
                >
                    Entendido
                </button>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        document
            .getElementById(
                "customOrderAlertButton"
            )
            .addEventListener(
                "click",
                () => {

                    overlay.classList.remove(
                        "show"
                    );

                }
            );


        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    const icon =
        document.getElementById(
            "customOrderAlertIcon"
        );

    const titleElement =
        document.getElementById(
            "customOrderAlertTitle"
        );

    const messageElement =
        document.getElementById(
            "customOrderAlertMessage"
        );


    const isSuccess =
        type === "success";


    icon.className =
        `custom-order-alert-icon ${
            isSuccess
                ? "success"
                : "error"
        }`;


    icon.innerHTML =
        isSuccess
            ? `<i class="fa-solid fa-check"></i>`
            : `<i class="fa-solid fa-triangle-exclamation"></i>`;


    titleElement.textContent =
        title ||
        (
            isSuccess
                ? "Operación exitosa"
                : "Ocurrió un error"
        );


    messageElement.textContent =
        message;


    overlay.classList.add(
        "show"
    );

}
// =====================================================
// CONFIRMACIÓN DE CAMBIO DE ESTADO
// =====================================================

function showStatusConfirmation(
    orderId,
    previousStatus,
    newStatus
) {

    return new Promise(resolve => {

        const overlay =
            document.createElement("div");

        overlay.className =
            "status-confirm-overlay";

        overlay.innerHTML = `

            <div class="status-confirm-modal">

                <div class="status-confirm-icon">

                    <i class="fa-solid fa-arrows-rotate"></i>

                </div>


                <h3>
                    ¿Confirmar cambio?
                </h3>


                <p>

                    El pedido

                    <strong>
                        #${escapeHTML(orderId)}
                    </strong>

                    cambiará de

                    <strong>
                        ${escapeHTML(previousStatus)}
                    </strong>

                    a

                    <strong>
                        ${escapeHTML(newStatus)}
                    </strong>.

                </p>


                <div class="status-confirm-actions">

                    <button
                        type="button"
                        class="status-confirm-cancel"
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        class="status-confirm-save"
                    >

                        <i class="fa-solid fa-check"></i>

                        Confirmar cambio

                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );


        const cancelButton =
            overlay.querySelector(
                ".status-confirm-cancel"
            );


        const confirmButton =
            overlay.querySelector(
                ".status-confirm-save"
            );


        let resolved = false;


        function close(result) {

            if (resolved) {

                return;

            }


            resolved = true;


            overlay.remove();


            resolve(result);

        }


        cancelButton.addEventListener(
            "click",
            () => {

                close(false);

            }
        );


        confirmButton.addEventListener(
            "click",
            () => {

                close(true);

            }
        );


        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    close(false);

                }

            }
        );

    });

}
// =====================================================
// TEXTO DEL ESTADO
// =====================================================

function getStatusText(status) {

    const names = {

        pendiente: "Pendiente",

        confirmado: "Confirmado",

        enviado: "Enviado",

        entregado: "Entregado",

        cancelado: "Cancelado"

    };


    return (
        names[status] ||
        status ||
        "Desconocido"
    );

}


// =====================================================
// CLASE DEL ESTADO
// =====================================================

function getStatusClass(status) {

    const allowed = [

        "pendiente",

        "confirmado",

        "enviado",

        "entregado",

        "cancelado"

    ];


    if (
        allowed.includes(status)
    ) {

        return `status-${status}`;

    }


    return "status-pendiente";

}


// =====================================================
// CARGAR PEDIDOS
// =====================================================

async function loadOrders() {

    try {

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="orders-message"
                >

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    Cargando pedidos...

                </td>

            </tr>

        `;


        const response =
            await fetch(
                `${API_URL}/api/orders`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudieron obtener los pedidos."

            );

        }


        orders =
            data.orders || [];


        updateStatistics();


        renderOrders(
            orders
        );


    } catch (error) {

        console.error(
            "Error cargando pedidos:",
            error
        );


        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="orders-message"
                >

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    No se pudieron cargar los pedidos.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function updateStatistics() {

    const total =
        orders.length;


    const pending =
        orders.filter(
            order =>
                order.status === "pendiente"
        ).length;


    const confirmed =
        orders.filter(
            order =>
                order.status === "confirmado"
        ).length;


    const delivered =
        orders.filter(
            order =>
                order.status === "entregado"
        ).length;


    totalOrders.textContent =
        total;


    pendingOrders.textContent =
        pending;


    confirmedOrders.textContent =
        confirmed;


    deliveredOrders.textContent =
        delivered;

}


// =====================================================
// MOSTRAR PEDIDOS
// =====================================================

function renderOrders(
    ordersToRender
) {

    if (
        !ordersToRender.length
    ) {

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="orders-message"
                >

                    <i
                        class="fa-solid fa-box-open"
                    ></i>

                    No hay pedidos para mostrar.

                </td>

            </tr>

        `;

        return;

    }


    ordersTableBody.innerHTML =
        ordersToRender
            .map(
                order =>
                    createOrderRow(
                        order
                    )
            )
            .join("");

}


// =====================================================
// CREAR FILA
// =====================================================

function createOrderRow(order) {

    const status =
        String(
            order.status || "pendiente"
        ).toLowerCase();


    return `

        <tr>

            <td>

                <span class="order-number">

                    #${escapeHTML(order.id)}

                </span>

            </td>


            <td>

                <span class="customer-name">

                    ${escapeHTML(
                        order.customer_name
                    )}

                </span>

                <span class="customer-email">

                    ${escapeHTML(
                        order.customer_email
                    )}

                </span>

            </td>


            <td>

                ${formatDate(
                    order.created_at
                )}

            </td>


            <td>

                <span class="order-total">

                    ${formatCurrency(
                        order.total
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        status-badge
                        ${getStatusClass(status)}
                    "
                >

                    ${getStatusText(status)}

                </span>

            </td>


            <td>

                <button
                    type="button"
                    class="view-order-btn"
                    title="Ver pedido"
                    data-order-id="${order.id}"
                >

                    <i
                        class="fa-solid fa-eye"
                    ></i>

                </button>

            </td>

        </tr>

    `;

}


// =====================================================
// FILTRAR PEDIDOS
// =====================================================

function filterOrders() {

    const search =
        String(
            orderSearch.value || ""
        )
        .trim()
        .toLowerCase();


    const status =
        statusFilter.value;


    const filtered =
        orders.filter(
            order => {

                const matchesSearch =

                    !search ||

                    String(
                        order.id
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.customer_name
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.customer_email
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        order.customer_phone
                    )
                    .toLowerCase()
                    .includes(search);


                const matchesStatus =

                    !status ||

                    order.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    renderOrders(
        filtered
    );

}


// =====================================================
// BUSCADOR PRINCIPAL
// =====================================================

if (globalSearch) {

    globalSearch.addEventListener(
        "input",
        () => {

            orderSearch.value =
                globalSearch.value;

            filterOrders();

        }
    );

}


// =====================================================
// BUSCADOR DE PEDIDOS
// =====================================================

if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        filterOrders
    );

}


// =====================================================
// FILTRO DE ESTADO
// =====================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterOrders
    );

}


// =====================================================
// ABRIR PEDIDO
// =====================================================

async function openOrder(
    orderId
) {

    try {

        orderModal.classList.add(
            "open"
        );


        modalTitle.textContent =
            `Pedido #${orderId}`;


        modalBody.innerHTML = `

            <div class="orders-message">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Cargando información...

            </div>

        `;


        const response =
            await fetch(
                `${API_URL}/api/orders/${orderId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudo obtener el pedido."

            );

        }


        currentOrder =
            data.order;


        renderOrderDetail(
            currentOrder
        );


    } catch (error) {

        console.error(
            "Error obteniendo pedido:",
            error
        );


        modalBody.innerHTML = `

            <div class="orders-message">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                No se pudo cargar el pedido.

            </div>

        `;

    }

}

// =====================================================
// PROGRESO DEL PEDIDO
// =====================================================

function createOrderProgress(order) {

    const status =
        String(
            order.status ||
            "pendiente"
        ).toLowerCase();


    const steps = [

        {
            status: "pendiente",
            icon: "fa-receipt",
            title: "Pedido recibido"
        },

        {
            status: "confirmado",
            icon: "fa-circle-check",
            title: "Confirmado"
        },

        {
            status: "enviado",
            icon: "fa-truck",
            title: "Enviado"
        },

        {
            status: "entregado",
            icon: "fa-box-open",
            title: "Entregado"
        }

    ];


    const statusOrder = {

        pendiente: 0,
        confirmado: 1,
        enviado: 2,
        entregado: 3

    };


    const currentIndex =
        statusOrder[status] !== undefined
            ? statusOrder[status]
            : 0;


    const progressHTML =
        steps.map(
            (step, index) => {

                const completed =
                    index <
                    currentIndex;


                const current =
                    index ===
                    currentIndex;


                const className =
                    completed
                        ? "completed"
                        : current
                            ? "current"
                            : "";


                return `

                    <div
                        class="order-progress-step ${className}"
                    >

                        <div
                            class="order-progress-icon"
                        >

                            <i
                                class="fa-solid ${step.icon}"
                            ></i>

                        </div>


                        <span>
                            ${step.title}
                        </span>

                    </div>


                    ${
                        index <
                        steps.length - 1
                            ? `

                                <div
                                    class="order-progress-line ${
                                        index <
                                        currentIndex
                                            ? "completed"
                                            : ""
                                    }"
                                ></div>

                              `
                            : ""
                    }

                `;

            }
        ).join("");


    const cancelledHTML =
        status === "cancelado"
            ? `

                <div class="order-progress-cancelled">

                    <i
                        class="fa-solid fa-circle-xmark"
                    ></i>

                    <span>
                        Pedido cancelado
                    </span>

                </div>

              `
            : "";


    return `

        <div class="order-progress">

            <div class="order-progress-header">

                <div>

                    <span class="order-progress-label">
                        SEGUIMIENTO DEL PEDIDO
                    </span>

                    <h3>
                        Estado del pedido
                    </h3>

                </div>


                <span
                    class="status-badge ${getStatusClass(status)}"
                >
                    ${getStatusText(status)}
                </span>

            </div>


            <div class="order-progress-track">

                ${progressHTML}

            </div>


            ${cancelledHTML}

        </div>

    `;

}

// =====================================================
// ESTADOS DISPONIBLES SEGÚN EL ESTADO ACTUAL
// =====================================================

function getAvailableStatusOptions(
    currentStatus
) {

    const transitions = {

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


    const statusNames = {

        pendiente:
            "Pendiente",

        confirmado:
            "Confirmado",

        enviado:
            "Enviado",

        entregado:
            "Entregado",

        cancelado:
            "Cancelado"

    };


    const current =
        String(
            currentStatus || ""
        )
            .trim()
            .toLowerCase();


    // =================================================
    // PEDIDO ENTREGADO
    // NO PUEDE CAMBIAR
    // =================================================

    if (
        current === "entregado"
    ) {

        return `

            <option
                value="entregado"
                selected
            >
                Entregado
            </option>

        `;

    }


    const available =
        transitions[current] || [];


    return [

        `
        <option
            value="${current}"
            selected
        >
            ${statusNames[current] || current}
        </option>
        `,

        ...available.map(
            status => `

                <option
                    value="${status}"
                >
                    ${statusNames[status]}
                </option>

            `
        )

    ].join("");

}
// =====================================================
// MOSTRAR DETALLE
// =====================================================

// =====================================================
// ESTADOS DISPONIBLES SEGÚN EL ESTADO ACTUAL
// =====================================================

function getAvailableStatusOptions(
    currentStatus
) {

    const transitions = {

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


    const statusNames = {

        pendiente:
            "Pendiente",

        confirmado:
            "Confirmado",

        enviado:
            "Enviado",

        entregado:
            "Entregado",

        cancelado:
            "Cancelado"

    };


    const current =
        String(
            currentStatus || ""
        )
            .trim()
            .toLowerCase();


    // PEDIDO ENTREGADO:
    // NO PERMITIR CAMBIOS

    if (
        current === "entregado"
    ) {

        return `

            <option
                value="entregado"
                selected
            >
                Entregado
            </option>

        `;

    }


    const available =
        transitions[current] || [];


    return [

        `
        <option
            value="${current}"
            selected
        >
            ${statusNames[current] || current}
        </option>
        `,


        ...available.map(
            status => `

                <option
                    value="${status}"
                >
                    ${statusNames[status]}
                </option>

            `
        )

    ].join("");

}


// =====================================================
// MOSTRAR DETALLE
// =====================================================


function renderOrderDetail(
    order
) {

    const items =
        order.items || [];


    const itemsHTML =
        items.length

            ? items
                .map(
                    item =>
                        createOrderItem(
                            item
                        )
                )
                .join("")

            : `

                <div class="orders-message">

                    No hay productos registrados.

                </div>

            `;


   modalBody.innerHTML = `

    <!-- =========================================
         PROGRESO DEL PEDIDO
    ========================================== -->

    ${createOrderProgress(order)}


    <!-- INFORMACIÓN -->

    <div class="detail-grid">


            <div class="detail-box">

                <h3>
                    Cliente
                </h3>


                <p>

                    <strong>
                        Nombre:
                    </strong>

                    ${escapeHTML(
                        order.customer_name
                    )}

                </p>


                <p>

                    <strong>
                        Teléfono:
                    </strong>

                    ${escapeHTML(
                        order.customer_phone
                    )}

                </p>


                <p>

                    <strong>
                        Correo:
                    </strong>

                    ${escapeHTML(
                        order.customer_email
                    )}

                </p>

                <button
    type="button"
    class="customer-orders-btn"
    id="customerOrdersBtn"
>
    <i class="fa-solid fa-clock-rotate-left"></i>

    Ver pedidos del cliente
</button>

            </div>



            <div class="detail-box">

                <h3>
                    Entrega
                </h3>


                <p>

                    <strong>
                        Provincia:
                    </strong>

                    ${escapeHTML(
                        order.province
                    )}

                </p>


                <p>

                    <strong>
                        Ciudad:
                    </strong>

                    ${escapeHTML(
                        order.city
                    )}

                </p>


                <p>

                    <strong>
                        Dirección:
                    </strong>

                    ${escapeHTML(
                        order.address
                    )}

                </p>


                <p>

                    <strong>
                        Referencia:
                    </strong>

                    ${escapeHTML(
                        order.reference_address ||
                        "No indicada"
                    )}

                </p>

            </div>



            <div class="detail-box">

                <h3>
                    Pedido
                </h3>


                <p>

                    <strong>
                        Número:
                    </strong>

                    #${escapeHTML(
                        order.id
                    )}

                </p>


                <p>

                    <strong>
                        Fecha:
                    </strong>

                    ${formatDate(
                        order.created_at
                    )}

                </p>


                <p>

                    <strong>
                        Pago:
                    </strong>

                    ${escapeHTML(
                        getPaymentText(
                            order.payment_method
                        )
                    )}

                </p>

            </div>



            <div class="detail-box">

                <h3>
                    Estado actual
                </h3>


                <p>

                    <strong>
                        ${getStatusText(
                            order.status
                        )}

                    </strong>

                </p>

            </div>

        </div>



        <!-- PRODUCTOS -->

        <div class="order-items">

            <h3>
                Productos del pedido
            </h3>


            ${itemsHTML}

        </div>



        <!-- TOTALES -->

        <div class="modal-total">


            <div class="modal-total-row">

                <span>
                    Subtotal
                </span>

                <span>
                    ${formatCurrency(
                        order.subtotal
                    )}
                </span>

            </div>


            <div class="modal-total-row">

                <span>
                    Envío
                </span>

                <span>
                    ${formatCurrency(
                        order.shipping
                    )}
                </span>

            </div>


            <div
                class="modal-total-row total"
            >

                <span>
                    Total
                </span>

                <strong>
                    ${formatCurrency(
                        order.total
                    )}
                </strong>

            </div>

        </div>



               <!-- CAMBIAR ESTADO -->

        <div class="status-editor">

            <label
                for="orderStatusSelect"
            >

                Cambiar estado del pedido

            </label>


            <div class="status-editor-row">


                <select
                    id="orderStatusSelect"
                >

                    ${getAvailableStatusOptions(
                        order.status
                    )}

                </select>


                <button
                    type="button"
                    id="saveStatusBtn"
                    class="save-status-btn"
                >

                    Guardar estado

                </button>

            </div>

        </div>

    `;


 const saveStatusButton =
    document.getElementById(
        "saveStatusBtn"
    );

if (saveStatusButton) {

    saveStatusButton.addEventListener(
        "click",
        saveOrderStatus
    );

}


// =================================================
// VER PEDIDOS ANTERIORES DEL CLIENTE
// =================================================

const customerOrdersButton =
    document.getElementById(
        "customerOrdersBtn"
    );

if (customerOrdersButton) {

    customerOrdersButton.addEventListener(
        "click",
        () => {

            openCustomerOrders(
                order.customer_email,
                order.customer_phone,
                order.customer_name
            );

        }
    );

}

}


// =====================================================
// CREAR PRODUCTO DEL PEDIDO
// =====================================================

function createOrderItem(
    item
) {

    let imageHTML = `

        <i
            class="fa-solid fa-mobile-screen"
        ></i>

    `;


    if (item.image) {

        const imageURL =
            item.image.startsWith("http")

                ? item.image

                : `${API_URL}${item.image}`;


        imageHTML = `

            <img
                src="${escapeHTML(imageURL)}"
                alt="${escapeHTML(
                    `${item.brand || ""} ${item.model || ""}`
                )}"
                onerror="this.style.display='none'"
            >

        `;

    }


    const productName =

        `${item.brand || ""} ${item.model || ""}`
        .trim();


    return `

        <div class="order-item">


            <div class="order-item-image">

                ${imageHTML}

            </div>


            <div class="order-item-name">

                <strong>

                    ${escapeHTML(
                        productName ||
                        "Producto"
                    )}

                </strong>


                <span>

                    Cantidad:
                    ${escapeHTML(
                        item.quantity
                    )}

                </span>

            </div>


            <div class="order-item-price">

                ${formatCurrency(
                    item.subtotal
                )}

            </div>

        </div>

    `;

}


// =====================================================
// MÉTODO DE PAGO
// =====================================================

function getPaymentText(
    paymentMethod
) {

    const methods = {

        transferencia:
            "Transferencia bancaria",

        contra_entrega:
            "Pago contra entrega"

    };


    return (
        methods[paymentMethod] ||
        paymentMethod ||
        "No indicado"
    );

}


// =====================================================
// GUARDAR ESTADO
// =====================================================

// =====================================================
// GUARDAR ESTADO DEL PEDIDO
// =====================================================

async function saveOrderStatus() {

    if (!currentOrder) {

        return;

    }


    const select =
        document.getElementById(
            "orderStatusSelect"
        );


    const button =
        document.getElementById(
            "saveStatusBtn"
        );


    if (!select || !button) {

        return;

    }


    // =================================================
    // NUEVO ESTADO
    // =================================================

    const newStatus =
        select.value;


    // =================================================
    // ESTADO ANTERIOR
    // =================================================

    const previousStatus =
        String(
            currentOrder.status ||
            "pendiente"
        ).toLowerCase();


    // =================================================
    // COMPROBAR SI NO HUBO CAMBIO
    // =================================================

    if (
        newStatus ===
        previousStatus
    ) {

        showCustomAlert(
            "El pedido ya tiene este estado.",
            "error",
            "Estado sin cambios"
        );

        return;

    }


    // =================================================
    // PEDIR CONFIRMACIÓN
    // =================================================

    const confirmed =
        await showStatusConfirmation(
            currentOrder.id,
            getStatusText(
                previousStatus
            ),
            getStatusText(
                newStatus
            )
        );


    // =================================================
    // CANCELÓ
    // =================================================

    if (!confirmed) {

        select.value =
            previousStatus;

        return;

    }


    // =================================================
    // GUARDAR TEXTO ORIGINAL DEL BOTÓN
    // =================================================

    const previousText =
        button.textContent;


    try {

        // ---------------------------------------------
        // BLOQUEAR BOTÓN
        // ---------------------------------------------

        button.disabled =
            true;


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Guardando...
        `;


        // ---------------------------------------------
        // ACTUALIZAR EN BACKEND
        // ---------------------------------------------

        const response =
            await fetch(

                `${API_URL}/api/orders/${currentOrder.id}/status`,

                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }

            );


        // ---------------------------------------------
        // RESPUESTA
        // ---------------------------------------------

        const data =
            await response.json();


        // ---------------------------------------------
        // COMPROBAR ERROR
        // ---------------------------------------------

        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudo actualizar el estado."

            );

        }


        // =================================================
        // ACTUALIZAR PEDIDO ACTUAL
        // =================================================

        currentOrder.status =
            data.status;


        // =================================================
        // ACTUALIZAR PEDIDO EN MEMORIA
        // =================================================

        const index =
            orders.findIndex(

                order =>

                    Number(order.id) ===
                    Number(currentOrder.id)

            );


        if (index !== -1) {

            orders[index].status =
                data.status;

        }
// =================================================
// AVISAR AL DASHBOARD QUE CAMBIÓ UN PEDIDO
// =================================================

localStorage.setItem(
    "smartphoneRD_order_updated",
    JSON.stringify({

        orderId:
            currentOrder.id,

        status:
            data.status,

        timestamp:
            Date.now()

    })
);

        // =================================================
        // ACTUALIZAR ESTADÍSTICAS
        // =================================================

        updateStatistics();


        // =================================================
        // ACTUALIZAR TABLA
        // =================================================

        filterOrders();


        // =================================================
        // ACTUALIZAR MODAL
        // =================================================

        renderOrderDetail(
            currentOrder
        );


        // =================================================
        // MOSTRAR ÉXITO
        // =================================================

        showCustomAlert(
            `El pedido #${currentOrder.id} ahora está en estado ${getStatusText(data.status)}.`,
            "success",
            "Estado actualizado"
        );


    } catch (error) {

        console.error(
            "Error actualizando estado:",
            error
        );


        // =================================================
        // MOSTRAR ERROR
        // =================================================

        showCustomAlert(
            error.message ||
            "No se pudo actualizar el estado.",
            "error",
            "No se pudo actualizar"
        );


    } finally {

        // =================================================
        // RESTAURAR BOTÓN
        // =================================================

        button.disabled =
            false;


        button.textContent =
            previousText;

    }

}


// =====================================================
// CLIC EN VER PEDIDO
// =====================================================

if (ordersTableBody) {

    ordersTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".view-order-btn"
                );


            if (!button) {

                return;

            }


            const orderId =
                button.dataset.orderId;


            openOrder(
                orderId
            );

        }
    );

}

// =====================================================
// VER PEDIDOS ANTERIORES DEL CLIENTE
// =====================================================

async function openCustomerOrders(
    email,
    phone,
    customerName
) {

    try {

        const params =
            new URLSearchParams({

                email:
                    email || "",

                phone:
                    phone || ""

            });


        const response =
            await fetch(

                `${API_URL}/api/orders/customer-orders?${params.toString()}`

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudieron obtener los pedidos del cliente."

            );

        }


        const customerOrders =
            data.orders || [];


        // =================================================
        // CREAR VENTANA
        // =================================================

        let overlay =
            document.getElementById(
                "customerOrdersModal"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );


            overlay.id =
                "customerOrdersModal";


            overlay.className =
                "customer-orders-modal";


            document.body.appendChild(
                overlay
            );

        }


        const ordersHTML =
            customerOrders.length

                ? customerOrders
                    .map(
                        order => {

                            const status =
                                String(
                                    order.status ||
                                    "pendiente"
                                )
                                    .trim()
                                    .toLowerCase();


                            return `

                                <div
                                    class="customer-order-row"
                                >

                                    <div
                                        class="customer-order-main"
                                    >

                                        <strong>
                                            #${escapeHTML(
                                                order.id
                                            )}
                                        </strong>

                                        <span>
                                            ${formatDate(
                                                order.created_at
                                            )}
                                        </span>

                                    </div>


                                    <div
                                        class="customer-order-status"
                                    >

                                        <span
                                            class="
                                                status-badge
                                                ${getStatusClass(
                                                    status
                                                )}
                                            "
                                        >
                                            ${getStatusText(
                                                status
                                            )}
                                        </span>

                                    </div>


                                    <div
                                        class="customer-order-total"
                                    >

                                        ${formatCurrency(
                                            order.total
                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        class="customer-view-order-btn"
                                        data-order-id="${escapeHTML(
                                            order.id
                                        )}"
                                        title="Ver pedido"
                                    >

                                        <i
                                            class="fa-solid fa-eye"
                                        ></i>

                                    </button>

                                </div>

                            `;

                        }
                    )
                    .join("")

                : `

                    <div
                        class="customer-orders-empty"
                    >

                        <i
                            class="fa-solid fa-box-open"
                        ></i>

                        <span>
                            Este cliente no tiene otros pedidos.
                        </span>

                    </div>

                `;


        overlay.innerHTML = `

            <div
                class="customer-orders-content"
            >

                <div
                    class="customer-orders-header"
                >

                    <div>

                        <span>
                            HISTORIAL DE COMPRAS
                        </span>

                        <h3>
                            ${escapeHTML(
                                customerName
                            )}
                        </h3>

                    </div>


                    <button
                        type="button"
                        class="customer-orders-close"
                        id="customerOrdersClose"
                    >

                        <i
                            class="fa-solid fa-xmark"
                        ></i>

                    </button>

                </div>


                <div
                    class="customer-orders-summary"
                >

                    <div>

                        <span>
                            Pedidos
                        </span>

                        <strong>
                            ${data.totalOrders || 0}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total comprado
                        </span>

                        <strong>
                            ${formatCurrency(
                                data.totalPurchased || 0
                            )}
                        </strong>

                    </div>

                </div>


                <div
                    class="customer-orders-list"
                >

                    ${ordersHTML}

                </div>

            </div>

        `;


        overlay.classList.add(
            "open"
        );


        // =================================================
        // CERRAR
        // =================================================

        const closeButton =
            document.getElementById(
                "customerOrdersClose"
            );


        if (closeButton) {

            closeButton.onclick =
                () => {

                    overlay.classList.remove(
                        "open"
                    );

                };

        }


        // =================================================
        // VER PEDIDO
        // =================================================

        overlay
            .querySelectorAll(
                ".customer-view-order-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const orderId =
                                button.dataset.orderId;


                            overlay.classList.remove(
                                "open"
                            );


                            openOrder(
                                orderId
                            );

                        }
                    );

                }
            );


        // =================================================
        // CERRAR AL HACER CLICK FUERA
        // =================================================

        overlay.onclick =
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.classList.remove(
                        "open"
                    );

                }

            };


    } catch (error) {

        console.error(
            "Error obteniendo pedidos del cliente:",
            error
        );


        showCustomAlert(

            error.message ||
            "No se pudieron cargar los pedidos del cliente.",

            "error",

            "Error"

        );

    }

}


// =====================================================
// VER PEDIDOS ANTERIORES DEL CLIENTE
// =====================================================

async function openCustomerOrders(
    email,
    phone,
    customerName
) {

    try {

        const params =
            new URLSearchParams();

        if (email) {

            params.set(
                "email",
                email
            );

        }

        if (phone) {

            params.set(
                "phone",
                phone
            );

        }


        const response =
            await fetch(
                `${API_URL}/api/orders/customer-orders?${params.toString()}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No se pudieron obtener los pedidos del cliente."
            );

        }


        const customerOrders =
            data.orders || [];


        let overlay =
            document.getElementById(
                "customerOrdersModal"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );


            overlay.id =
                "customerOrdersModal";


            overlay.className =
                "customer-orders-modal";


            document.body.appendChild(
                overlay
            );

        }


        const ordersHTML =
            customerOrders.length

                ? customerOrders
                    .map(
                        order => {

                            const status =
                                String(
                                    order.status ||
                                    "pendiente"
                                )
                                    .trim()
                                    .toLowerCase();


                            return `

                                <div class="customer-order-row">

                                    <div class="customer-order-main">

                                        <strong>
                                            Pedido #${escapeHTML(
                                                order.id
                                            )}
                                        </strong>

                                        <span>
                                            ${formatDate(
                                                order.created_at
                                            )}
                                        </span>

                                    </div>


                                    <div class="customer-order-status">

                                        <span
                                            class="status-badge ${getStatusClass(status)}"
                                        >
                                            ${getStatusText(status)}
                                        </span>

                                    </div>


                                    <div class="customer-order-total">

                                        ${formatCurrency(
                                            order.total
                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        class="customer-view-order-btn"
                                        data-order-id="${escapeHTML(
                                            order.id
                                        )}"
                                    >

                                        <i class="fa-solid fa-eye"></i>

                                    </button>

                                </div>

                            `;

                        }
                    )
                    .join("")

                : `

                    <div class="customer-orders-empty">

                        <i class="fa-solid fa-box-open"></i>

                        <span>
                            Este cliente no tiene pedidos.
                        </span>

                    </div>

                `;


        overlay.innerHTML = `

            <div class="customer-orders-content">

                <div class="customer-orders-header">

                    <div>

                        <span>
                            HISTORIAL DE COMPRAS
                        </span>

                        <h3>
                            ${escapeHTML(
                                customerName ||
                                "Cliente"
                            )}
                        </h3>

                    </div>


                    <button
                        type="button"
                        class="customer-orders-close"
                        id="customerOrdersClose"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <div class="customer-orders-summary">

                    <div>

                        <span>
                            Pedidos
                        </span>

                        <strong>
                            ${data.totalOrders || 0}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total comprado
                        </span>

                        <strong>
                            ${formatCurrency(
                                data.totalPurchased || 0
                            )}
                        </strong>

                    </div>

                </div>


                <div class="customer-orders-list">

                    ${ordersHTML}

                </div>

            </div>

        `;


        overlay.classList.add(
            "open"
        );


        // =================================================
        // CERRAR
        // =================================================

        const closeButton =
            document.getElementById(
                "customerOrdersClose"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    overlay.classList.remove(
                        "open"
                    );

                }
            );

        }


        // =================================================
        // VER PEDIDO
        // =================================================

        overlay
            .querySelectorAll(
                ".customer-view-order-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const orderId =
                                button.dataset.orderId;


                            overlay.classList.remove(
                                "open"
                            );


                            openOrder(
                                orderId
                            );

                        }
                    );

                }
            );


        // =================================================
        // CERRAR HACIENDO CLICK FUERA
        // =================================================

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.classList.remove(
                        "open"
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "Error obteniendo pedidos del cliente:",
            error
        );


        showCustomAlert(
            error.message ||
            "No se pudieron cargar los pedidos del cliente.",
            "error",
            "Error"
        );

    }

}
// =====================================================
// CERRAR MODAL
// =====================================================

function closeOrderModal() {

    orderModal.classList.remove(
        "open"
    );


    currentOrder =
        null;

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeOrderModal
    );

}


if (orderModal) {

    orderModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                orderModal
            ) {

                closeOrderModal();

            }

        }
    );

}


// =====================================================
// ESCAPE PARA CERRAR MODAL
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            orderModal.classList.contains(
                "open"
            )
        ) {

            closeOrderModal();

        }

    }
);


// =====================================================
// MENÚ MÓVIL
// =====================================================

if (menuBtn && sidebar) {

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

loadOrders();

// =====================================================
// NOTIFICACIONES DE PEDIDOS
// =====================================================

async function loadOrderNotifications() {

    const countElement =
        renderOrderDetail(
            "ordersNotificationCount"
        );


    const notificationButton =
        document.getElementById(
            "ordersNotificationBtn"
        );


    if (
        !countElement ||
        !notificationButton
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Error obteniendo pedidos."
            );

        }


        const orders =
            data.orders || [];


        const pendingOrders =
            orders.filter(
                order =>
                    String(
                        order.status
                    ).toLowerCase() ===
                    "pendiente"
            );


        const totalPending =
            pendingOrders.length;


        countElement.textContent =
            totalPending;


        if (
            totalPending === 0
        ) {

            countElement.style.display =
                "none";

            notificationButton.classList.remove(
                "has-notifications"
            );

        } else {

            countElement.style.display =
                "flex";

            notificationButton.classList.add(
                "has-notifications"
            );

        }


    } catch (error) {

        console.error(
            "Error cargando notificaciones:",
            error
        );

    }

}


// =====================================================
// INICIAR
// =====================================================

loadOrderNotifications();


// Actualizar cada 30 segundos

setInterval(
    loadOrderNotifications,
    30000
);


// =====================================================
// ABRIR PEDIDO DESDE CLIENTES
// =====================================================

function openOrderFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get(
            "order"
        );


    if (!orderId) {

        return;

    }


    // Esperar a que el módulo termine de cargar
    setTimeout(
        () => {

            openOrder(
                orderId
            );

        },
        300
    );

}

// =====================================================
// INICIAR PEDIDO DESDE URL
// =====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        openOrderFromURL
    );

} else {

    openOrderFromURL();

}