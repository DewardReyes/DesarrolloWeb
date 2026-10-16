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

const clientsGrid =
    document.getElementById(
        "clientsGrid"
    );


const totalClients =
    document.getElementById(
        "totalClients"
    );


const totalClientOrders =
    document.getElementById(
        "totalClientOrders"
    );


const totalClientSales =
    document.getElementById(
        "totalClientSales"
    );


const clientsCount =
    document.getElementById(
        "clientsCount"
    );


const clientSearch =
    document.getElementById(
        "clientSearch"
    );


const globalSearch =
    document.getElementById(
        "globalSearch"
    );


const clientModal =
    document.getElementById(
        "clientModal"
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

let customers = [];


// =====================================================
// INFORMACIÓN DEL ADMIN
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
// FORMATO MONEDA
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
// FORMATO FECHA
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
// OBTENER INICIAL
// =====================================================

function getInitial(name) {

    return String(
        name || "C"
    )
    .trim()
    .charAt(0)
    .toUpperCase();

}


// =====================================================
// CARGAR CLIENTES
// =====================================================

async function loadCustomers() {

    try {

        clientsGrid.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Cargando clientes...
                </span>

            </div>

        `;


        const response =
            await fetch(
                `${API_URL}/api/orders/customers`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudieron obtener los clientes."

            );

        }


        customers =
            data.customers || [];


        updateStatistics();


        renderCustomers(
            customers
        );


    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );


        clientsGrid.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <span>
                    No se pudieron cargar los clientes.
                </span>

            </div>

        `;

    }

}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function updateStatistics() {

    const numberOfClients =
        customers.length;


    const numberOfOrders =
        customers.reduce(
            (
                total,
                customer
            ) => {

                return total +
                    Number(
                        customer.total_pedidos || 0
                    );

            },
            0
        );


    const totalSales =
        customers.reduce(
            (
                total,
                customer
            ) => {

                return total +
                    Number(
                        customer.total_comprado || 0
                    );

            },
            0
        );


    if (totalClients) {

        totalClients.textContent =
            numberOfClients;

    }


    if (totalClientOrders) {

        totalClientOrders.textContent =
            numberOfOrders;

    }


    if (totalClientSales) {

        totalClientSales.textContent =
            formatCurrency(
                totalSales
            );

    }


    if (clientsCount) {

        clientsCount.textContent =

            `${numberOfClients} ${
                numberOfClients === 1
                    ? "cliente"
                    : "clientes"
            }`;

    }

}


// =====================================================
// MOSTRAR CLIENTES
// =====================================================

function renderCustomers(
    customersToRender
) {

    if (
        !customersToRender.length
    ) {

        clientsGrid.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-users-slash"
                ></i>

                <span>
                    No hay clientes para mostrar.
                </span>

            </div>

        `;

        return;

    }


    clientsGrid.innerHTML =
        customersToRender
            .map(
                customer =>
                    createCustomerCard(
                        customer
                    )
            )
            .join("");


    if (clientsCount) {

        clientsCount.textContent =

            `${customersToRender.length} ${
                customersToRender.length === 1
                    ? "cliente"
                    : "clientes"
            }`;

    }

}


// =====================================================
// CREAR TARJETA
// =====================================================

function createCustomerCard(
    customer
) {

    const name =
        customer.customer_name ||
        "Cliente";


    const phone =
        customer.customer_phone ||
        "No indicado";


    const email =
        customer.customer_email ||
        "No indicado";


    const province =
        customer.province ||
        "No indicada";


    const city =
        customer.city ||
        "No indicada";


    const totalOrders =
        Number(
            customer.total_pedidos || 0
        );


    const totalPurchased =
        Number(
            customer.total_comprado || 0
        );


    return `

        <article
            class="client-card"
        >


            <!-- CABECERA -->

            <div class="client-card-header">


                <div class="client-avatar">

                    ${escapeHTML(
                        getInitial(name)
                    )}

                </div>


                <div class="client-header-info">

                    <h2 class="client-name">

                        ${escapeHTML(name)}

                    </h2>


                    <span class="client-email">

                        ${escapeHTML(email)}

                    </span>

                </div>


            </div>



            <!-- INFORMACIÓN -->

            <div class="client-info">


                <div class="client-info-item">

                    <span>
                        Teléfono
                    </span>

                    <strong>
                        ${escapeHTML(phone)}
                    </strong>

                </div>


                <div class="client-info-item">

                    <span>
                        Provincia
                    </span>

                    <strong>
                        ${escapeHTML(province)}
                    </strong>

                </div>


                <div class="client-info-item">

                    <span>
                        Ciudad
                    </span>

                    <strong>
                        ${escapeHTML(city)}
                    </strong>

                </div>


                <div class="client-info-item">

                    <span>
                        Último pedido
                    </span>

                    <strong>
                        ${formatDate(
                            customer.ultimo_pedido
                        )}
                    </strong>

                </div>


            </div>



            <!-- RESUMEN -->

            <div class="client-summary">


                <div class="summary-item">

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        ${totalOrders}
                    </strong>

                </div>


                <div class="summary-item total">

                    <span>
                        Comprado
                    </span>

                    <strong>
                        ${formatCurrency(
                            totalPurchased
                        )}
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Cliente
                    </span>

                    <strong>
                        Activo
                    </strong>

                </div>


            </div>



            <!-- HISTORIAL -->

            <button
                type="button"
                class="client-action"
                data-email="${escapeHTML(email)}"
                data-name="${escapeHTML(name)}"
            >

                <i
                    class="fa-solid fa-clock-rotate-left"
                ></i>

                Ver historial de pedidos

            </button>


        </article>

    `;

}


// =====================================================
// BUSCAR CLIENTES
// =====================================================

function filterCustomers() {

    const search =
        String(
            clientSearch?.value || ""
        )
        .trim()
        .toLowerCase();


    if (!search) {

        renderCustomers(
            customers
        );

        return;

    }


    const filtered =
        customers.filter(
            customer => {

                const name =
                    String(
                        customer.customer_name || ""
                    )
                    .toLowerCase();


                const phone =
                    String(
                        customer.customer_phone || ""
                    )
                    .toLowerCase();


                const email =
                    String(
                        customer.customer_email || ""
                    )
                    .toLowerCase();


                const province =
                    String(
                        customer.province || ""
                    )
                    .toLowerCase();


                const city =
                    String(
                        customer.city || ""
                    )
                    .toLowerCase();


                return (

                    name.includes(search) ||

                    phone.includes(search) ||

                    email.includes(search) ||

                    province.includes(search) ||

                    city.includes(search)

                );

            }
        );


    renderCustomers(
        filtered
    );

}


// =====================================================
// BUSCADOR
// =====================================================

if (clientSearch) {

    clientSearch.addEventListener(
        "input",
        filterCustomers
    );

}


// =====================================================
// BUSCADOR GENERAL
// =====================================================

if (globalSearch) {

    globalSearch.addEventListener(
        "input",
        () => {

            if (clientSearch) {

                clientSearch.value =
                    globalSearch.value;

            }


            filterCustomers();

        }
    );

}


// =====================================================
// OBTENER HISTORIAL DEL CLIENTE
// =====================================================

async function openCustomerHistory(
    customerName,
    customerEmail
) {

    try {

        clientModal.classList.add(
            "open"
        );


        modalTitle.textContent =
            customerName;


        modalBody.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Cargando historial...
                </span>

            </div>

        `;


        /*
         * Obtenemos todos los pedidos.
         * Luego filtramos los pedidos
         * correspondientes al cliente.
         */

        const response =
            await fetch(
                `${API_URL}/api/orders`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.message ||
                "No se pudo obtener el historial."

            );

        }


        const orders =
            data.orders || [];


        const customerOrders =
            orders.filter(
                order =>

                    String(
                        order.customer_email || ""
                    )
                    .toLowerCase()
                    ===
                    String(
                        customerEmail || ""
                    )
                    .toLowerCase()

            );


        renderCustomerHistory(
            customerName,
            customerEmail,
            customerOrders
        );


    } catch (error) {

        console.error(
            "Error obteniendo historial:",
            error
        );


        modalBody.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <span>
                    No se pudo cargar el historial.
                </span>

            </div>

        `;

    }

}


// =====================================================
// MOSTRAR HISTORIAL
// =====================================================

function renderCustomerHistory(
    customerName,
    customerEmail,
    customerOrders
) {

    if (
        !customerOrders.length
    ) {

        modalBody.innerHTML = `

            <div class="clients-message">

                <i
                    class="fa-solid fa-box-open"
                ></i>

                <span>
                    Este cliente todavía no tiene pedidos.
                </span>

            </div>

        `;

        return;

    }


    const total =
        customerOrders.reduce(
            (
                sum,
                order
            ) => {

                return sum +
                    Number(
                        order.total || 0
                    );

            },
            0
        );


    const ordersHTML =
        customerOrders
            .map(
                order =>
                    createHistoryOrder(
                        order
                    )
            )
            .join("");


    modalBody.innerHTML = `

        <!-- INFORMACIÓN DEL CLIENTE -->

        <div class="modal-client-info">


            <div class="modal-info-box">

                <span>
                    Cliente
                </span>

                <strong>
                    ${escapeHTML(
                        customerName
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Correo
                </span>

                <strong>
                    ${escapeHTML(
                        customerEmail
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Pedidos
                </span>

                <strong>
                    ${customerOrders.length}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Total comprado
                </span>

                <strong>
                    ${formatCurrency(
                        total
                    )}
                </strong>

            </div>


        </div>



        <h3 class="history-title">

            Historial de pedidos

        </h3>


        ${ordersHTML}

    `;

}


// =====================================================
// CREAR PEDIDO DEL HISTORIAL
// =====================================================

function createHistoryOrder(
    order
) {

    const status =
        String(
            order.status ||
            "pendiente"
        )
            .trim()
            .toLowerCase();


    return `

        <div
            class="history-order"
        >

            <div
                class="history-order-header"
            >

                <span
                    class="history-order-number"
                >

                    #${escapeHTML(
                        order.id
                    )}

                </span>


                <span
                    class="history-order-total"
                >

                    ${formatCurrency(
                        order.total
                    )}

                </span>

            </div>



            <div
                class="history-order-info"
            >

                <span>

                    ${formatDate(
                        order.created_at
                    )}

                </span>


                <span
                    class="
                        history-status
                        ${escapeHTML(
                            status
                        )}
                    "
                >

                    ${escapeHTML(
                        getStatusText(
                            status
                        )
                    )}

                </span>

            </div>



            <!-- VER PEDIDO -->

            <button
                type="button"
                class="history-view-order"
                data-order-id="${escapeHTML(
                    order.id
                )}"
            >

                <i
                    class="fa-solid fa-eye"
                ></i>

                Ver pedido

            </button>

        </div>

    `;

}

// =====================================================
// TEXTO DEL ESTADO
// =====================================================

function getStatusText(
    status
) {

    const statuses = {

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


    return (

        statuses[status] ||
        status ||
        "Desconocido"

    );

}


// =====================================================
// CLIC EN VER HISTORIAL
// =====================================================

// =====================================================
// CLIC EN VER HISTORIAL
// =====================================================

if (clientsGrid) {

    clientsGrid.addEventListener(
        "click",
        event => {


            // =================================================
            // VER HISTORIAL DEL CLIENTE
            // =================================================

            const historyButton =
                event.target.closest(
                    ".client-action"
                );


            if (historyButton) {

                const name =
                    historyButton.dataset.name;


                const email =
                    historyButton.dataset.email;


                openCustomerHistory(
                    name,
                    email
                );


                return;

            }

        }
    );

}



// =====================================================
// CLIC EN VER PEDIDO DEL HISTORIAL
// =====================================================

if (modalBody) {

    modalBody.addEventListener(
        "click",
        event => {


            const orderButton =
                event.target.closest(
                    ".history-view-order"
                );


            if (!orderButton) {

                return;

            }


            event.preventDefault();


            const orderId =
                orderButton.dataset.orderId;


            console.log(
                "Pedido seleccionado:",
                orderId
            );


            if (!orderId) {

                console.error(
                    "El botón no tiene data-order-id."
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
                "Abriendo:",
                orderUrl.href
            );


            window.location.assign(
                orderUrl.href
            );

        }
    );

}

// =====================================================
// CERRAR MODAL
// =====================================================

function closeClientModal() {

    if (!clientModal) {

        return;

    }


    clientModal.classList.remove(
        "open"
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeClientModal
    );

}


if (clientModal) {

    clientModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                clientModal
            ) {

                closeClientModal();

            }

        }
    );

}


// =====================================================
// ESCAPE
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeClientModal();

        }

    }
);


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

loadCustomers();