const API_URL = "http://localhost:3000";


// ==========================================
// VERIFICAR SESIÓN
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


// ==========================================
// VERIFICAR ADMIN
// ==========================================

if (user && user.role !== "admin") {

    localStorage.removeItem(
        "smartphoneToken"
    );

    localStorage.removeItem(
        "smartphoneUser"
    );

    window.location.href =
        "../pages/login.html";

}


// ==========================================
// ELEMENTOS
// ==========================================

const sidebarName =
    document.getElementById("sidebarName");

const headerName =
    document.getElementById("headerName");

const welcomeTitle =
    document.getElementById("welcomeTitle");

const profileAvatar =
    document.getElementById("profileAvatar");

const headerAvatar =
    document.getElementById("headerAvatar");


// ==========================================
// INFORMACIÓN DEL ADMIN
// ==========================================

if (user) {

    sidebarName.textContent =
        user.name;

    headerName.textContent =
        user.name;

    welcomeTitle.textContent =
        `Buenos días, ${user.name} `;


    const initial =
        user.name
            .charAt(0)
            .toUpperCase();


    profileAvatar.textContent =
        initial;

    headerAvatar.textContent =
        initial;

}


// ==========================================
// OBTENER PRODUCTOS
// ==========================================

async function loadProducts() {

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


        const products =
            data.products || [];


        updateStatistics(
            products
        );


        displayRecentProducts(
            products
        );


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        document.getElementById(
            "recentProducts"
        ).innerHTML = `

            <div class="loading">

                <i class="fa-solid fa-triangle-exclamation"></i>

                No se pudieron cargar los productos.

            </div>

        `;

    }

}


// ==========================================
// ESTADÍSTICAS
// ==========================================

function updateStatistics(products) {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total +
                Number(product.stock || 0),
            0
        );


    const totalOffers =
        products.filter(
            product =>
                Boolean(product.is_offer)
        ).length;


    const totalFeatured =
        products.filter(
            product =>
                Boolean(product.is_featured)
        ).length;


    document.getElementById(
        "totalProducts"
    ).textContent =
        totalProducts;


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock;


    document.getElementById(
        "totalOffers"
    ).textContent =
        totalOffers;


    document.getElementById(
        "totalFeatured"
    ).textContent =
        totalFeatured;

}


// ==========================================
// PRODUCTOS RECIENTES
// ==========================================

function displayRecentProducts(products) {

    const container =
        document.getElementById(
            "recentProducts"
        );


    if (products.length === 0) {

        container.innerHTML = `

            <div class="loading">

                <i class="fa-solid fa-box-open"></i>

                Todavía no tienes productos.

            </div>

        `;

        return;

    }


    const recent =
        products.slice(0, 5);


    container.innerHTML =
        recent.map(product => {

            const price =
                new Intl.NumberFormat(
                    "es-DO",
                    {
                        style: "currency",
                        currency: "DOP",
                        maximumFractionDigits: 0
                    }
                ).format(
                    product.price
                );


            return `

                <div class="recent-product">

                    <div class="product-icon">

                        <i class="fa-solid fa-mobile-screen"></i>

                    </div>


                    <div class="product-data">

                        <strong>
                            ${escapeHTML(
                                product.brand
                            )}
                            ${escapeHTML(
                                product.model
                            )}
                        </strong>

                        <span>
                            Stock:
                            ${product.stock}
                        </span>

                    </div>


                    <div class="product-price">

                        ${price}

                    </div>

                </div>

            `;

        }).join("");

}

// =====================================================
// PEDIDOS RECIENTES DEL DASHBOARD
// =====================================================

async function loadRecentOrders() {

    const container =
        document.getElementById(
            "recentOrders"
        );


    if (!container) {

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


        // =============================================
        // ORDENAR DEL MÁS RECIENTE AL MÁS ANTIGUO
        // =============================================

        orders.sort(
            (
                a,
                b
            ) =>
                new Date(
                    b.created_at
                ) -
                new Date(
                    a.created_at
                )
        );


        const recentOrders =
            orders.slice(
                0,
                5
            );


        // =============================================
        // SIN PEDIDOS
        // =============================================

        if (
            recentOrders.length === 0
        ) {

            container.innerHTML = `

                <div class="loading">

                    <i
                        class="fa-solid fa-cart-shopping"
                    ></i>

                    No hay pedidos registrados.

                </div>

            `;

            return;

        }


        // =============================================
        // GENERAR PEDIDOS
        // =============================================

        container.innerHTML =

            recentOrders
                .map(
                    order => {

                        const total =
                            new Intl.NumberFormat(
                                "es-DO",
                                {
                                    style:
                                        "currency",

                                    currency:
                                        "DOP",

                                    maximumFractionDigits:
                                        0
                                }
                            ).format(
                                Number(
                                    order.total ||
                                    0
                                )
                            );


                        const date =
                            new Date(
                                order.created_at
                            ).toLocaleDateString(
                                "es-DO",
                                {
                                    day:
                                        "2-digit",

                                    month:
                                        "short",

                                    year:
                                        "numeric"
                                }
                            );


                        const status =
                            String(
                                order.status ||
                                "pendiente"
                            ).toLowerCase();


                        return `

                            <a
                                href="pedidos.html"
                                class="recent-order"
                            >

                                <div
                                    class="recent-order-icon"
                                >

                                    <i
                                        class="fa-solid fa-cart-shopping"
                                    ></i>

                                </div>


                                <div
                                    class="recent-order-info"
                                >

                                    <strong>
                                        Pedido #${escapeHTML(
                                            order.id
                                        )}
                                    </strong>


                                    <span>
                                        ${escapeHTML(
                                            order.customer_name
                                        )}
                                    </span>


                                    <small>
                                        ${date}
                                    </small>

                                </div>


                                <div
                                    class="recent-order-right"
                                >

                                    <strong>
                                        ${total}
                                    </strong>


                                    <span
                                        class="recent-order-status ${getOrderStatusClass(status)}"
                                    >

                                        ${getOrderStatusText(status)}

                                    </span>

                                </div>

                            </a>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Error cargando pedidos recientes:",
            error
        );


        container.innerHTML = `

            <div class="loading">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                No se pudieron cargar los pedidos.

            </div>

        `;

    }

}

// =====================================================
// TEXTO DEL ESTADO DEL PEDIDO
// =====================================================

function getOrderStatusText(
    status
) {

    const names = {

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
        names[status] ||
        status
    );

}


// =====================================================
// CLASE DEL ESTADO DEL PEDIDO
// =====================================================

function getOrderStatusClass(
    status
) {

    const allowed = [

        "pendiente",
        "confirmado",
        "enviado",
        "entregado",
        "cancelado"

    ];


    if (
        allowed.includes(
            status
        )
    ) {

        return `status-${status}`;

    }


    return "status-pendiente";

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
// CERRAR SESIÓN
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
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


// ==========================================
// MENÚ MÓVIL
// ==========================================

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);

// =====================================================
// CARGA INICIAL DEL DASHBOARD
// =====================================================

loadProducts();

loadRecentOrders();

loadOrderStatistics();


// =====================================================
// ACTUALIZAR DASHBOARD AUTOMÁTICAMENTE
// =====================================================

setInterval(
    () => {

        loadProducts();

        loadRecentOrders();

        loadOrderStatistics();

    },
    30000
);
// =====================================================
// NOTIFICACIONES DE PEDIDOS
// =====================================================

// =====================================================
// NOTIFICACIONES DE PEDIDOS
// =====================================================

async function loadOrderNotifications() {

    const countElement =
        document.getElementById(
            "ordersNotificationCount"
        );


    const notificationButton =
        document.getElementById(
            "ordersNotificationBtn"
        );


    const notificationsList =
        document.getElementById(
            "notificationsList"
        );


    const notificationsPanel =
        document.getElementById(
            "notificationsPanel"
        );


    if (
        !countElement ||
        !notificationButton ||
        !notificationsList ||
        !notificationsPanel
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
                "No se pudieron obtener los pedidos."
            );

        }


        const orders =
            data.orders || [];


        // =================================================
        // PEDIDOS PENDIENTES
        // =================================================

        const pendingOrders =
            orders.filter(
                order =>

                    String(
                        order.status ||
                        ""
                    ).toLowerCase() ===
                    "pendiente"

            );


        const totalPending =
            pendingOrders.length;


        // =================================================
        // CONTADOR
        // =================================================

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


        // =================================================
        // SIN PEDIDOS
        // =================================================

        if (
            pendingOrders.length === 0
        ) {

            notificationsList.innerHTML = `

                <div class="notifications-empty">

                    <i class="fa-solid fa-circle-check"></i>

                    <span>
                        No tienes pedidos pendientes.
                    </span>

                </div>

            `;

        } else {

            // =============================================
            // MOSTRAR ÚLTIMOS PEDIDOS
            // =============================================

            const recentOrders =
                pendingOrders.slice(
                    0,
                    5
                );


            notificationsList.innerHTML =

                recentOrders
                    .map(
                        order => {

                            const total =
                                new Intl.NumberFormat(
                                    "es-DO",
                                    {
                                        style:
                                            "currency",

                                        currency:
                                            "DOP",

                                        maximumFractionDigits:
                                            0
                                    }
                                ).format(
                                    Number(
                                        order.total ||
                                        0
                                    )
                                );


                            return `

                                <a
                                    href="pedidos.html"
                                    class="notification-item"
                                    data-order-id="${escapeHTML(order.id)}"
                                >

                                    <div
                                        class="notification-item-icon"
                                    >

                                        <i
                                            class="fa-solid fa-cart-shopping"
                                        ></i>

                                    </div>


                                    <div
                                        class="notification-item-content"
                                    >

                                        <span
                                            class="notification-item-title"
                                        >
                                            Pedido #${escapeHTML(order.id)}
                                        </span>


                                        <span
                                            class="notification-item-customer"
                                        >
                                            ${escapeHTML(
                                                order.customer_name
                                            )}
                                        </span>


                                        <span
                                            class="notification-item-total"
                                        >
                                            ${total}
                                        </span>

                                    </div>


                                    <span
                                        class="notification-item-status"
                                    >
                                        Pendiente
                                    </span>

                                </a>

                            `;

                        }
                    )
                    .join("");

        }


    } catch (error) {

        console.error(
            "Error cargando notificaciones:",
            error
        );


        notificationsList.innerHTML = `

            <div class="notifications-empty">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <span>
                    No se pudieron cargar las notificaciones.
                </span>

            </div>

        `;

    }

}

// =====================================================
// ABRIR / CERRAR NOTIFICACIONES
// =====================================================

function setupNotifications() {

    const notificationButton =
        document.getElementById(
            "ordersNotificationBtn"
        );


    const notificationsPanel =
        document.getElementById(
            "notificationsPanel"
        );


    if (
        !notificationButton ||
        !notificationsPanel
    ) {

        return;

    }


    // =================================================
    // ABRIR / CERRAR AL HACER CLIC
    // =================================================

    notificationButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            notificationsPanel.classList.toggle(
                "show"
            );

        }
    );


    // =================================================
    // EVITAR QUE SE CIERRE AL HACER CLIC DENTRO
    // =================================================

    notificationsPanel.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );


    // =================================================
    // CERRAR AL HACER CLIC FUERA
    // =================================================

    document.addEventListener(
        "click",
        () => {

            notificationsPanel.classList.remove(
                "show"
            );

        }
    );

}
// =====================================================
// INICIAR NOTIFICACIONES
// =====================================================

function initializeOrderNotifications() {

    loadOrderNotifications();

    setupNotifications();


    // ================================================
    // ACTUALIZAR CADA 30 SEGUNDOS
    // ================================================

    setInterval(
        loadOrderNotifications,
        30000
    );

}


// =====================================================
// COMPROBAR SI EL DOM YA ESTÁ CARGADO
// =====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeOrderNotifications
    );

} else {

    initializeOrderNotifications();

}


// =====================================================
// ESTADÍSTICAS DE PEDIDOS
// =====================================================

async function loadOrderStatistics() {

    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );


    const pendingOrdersElement =
        document.getElementById(
            "pendingOrders"
        );


    const totalSalesElement =
        document.getElementById(
            "totalSales"
        );


    if (
        !totalOrdersElement ||
        !pendingOrdersElement ||
        !totalSalesElement
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
                "Error obteniendo estadísticas."
            );

        }


        const orders =
            data.orders || [];


        // =============================================
        // TOTAL DE PEDIDOS
        // =============================================

        const totalOrders =
            orders.length;


        // =============================================
        // PEDIDOS PENDIENTES
        // =============================================

        const pendingOrders =
            orders.filter(
                order =>
                    String(
                        order.status ||
                        ""
                    ).toLowerCase() ===
                    "pendiente"
            ).length;


        // =============================================
        // VENTAS
        //
        // No contamos pedidos cancelados.
        // =============================================

        const totalSales =
            orders
                .filter(
                    order =>
                        String(
                            order.status ||
                            ""
                        ).toLowerCase() !==
                        "cancelado"
                )
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        Number(
                            order.total ||
                            0
                        ),
                    0
                );


        // =============================================
        // MOSTRAR
        // =============================================

        totalOrdersElement.textContent =
            totalOrders;


        pendingOrdersElement.textContent =
            pendingOrders;


        totalSalesElement.textContent =
            new Intl.NumberFormat(
                "es-DO",
                {
                    style:
                        "currency",

                    currency:
                        "DOP",

                    maximumFractionDigits:
                        0
                }
            ).format(
                totalSales
            );


    } catch (error) {

        console.error(
            "Error cargando estadísticas de pedidos:",
            error
        );


        totalOrdersElement.textContent =
            "—";

        pendingOrdersElement.textContent =
            "—";

        totalSalesElement.textContent =
            "—";

    }

}


// =====================================================
// ACTUALIZACIÓN INMEDIATA DEL DASHBOARD
// =====================================================

window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            "smartphoneRD_order_updated"
        ) {

            return;

        }


        console.log(
            "Pedido actualizado. Refrescando Dashboard..."
        );


        // Actualizar pedidos recientes

        loadRecentOrders();


        // Actualizar estadísticas

        loadOrderStatistics();


        // Actualizar notificaciones

        loadOrderNotifications();

    }
);

// =====================================================
// ACTUALIZAR AL VOLVER A LA PÁGINA
// =====================================================

window.addEventListener(
    "pageshow",
    () => {

        loadRecentOrders();

        loadOrderStatistics();

        loadOrderNotifications();

    }
);