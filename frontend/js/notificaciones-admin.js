// =====================================================
// NOTIFICACIONES ADMINISTRATIVAS
// =====================================================

(function () {

    const API_URL =
        "http://localhost:3000";


    // =================================================
    // OBTENER ELEMENTOS
    // =================================================

    function getElements() {

        return {

            button:
                document.getElementById(
                    "ordersNotificationBtn"
                ),

            count:
                document.getElementById(
                    "ordersNotificationCount"
                ),

            panel:
                document.getElementById(
                    "notificationsPanel"
                ),

            list:
                document.getElementById(
                    "notificationsList"
                )

        };

    }


    // =================================================
    // ESCAPAR HTML
    // =================================================

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    // =================================================
    // CARGAR NOTIFICACIONES
    // =================================================

    async function loadNotifications() {

        const {
            button,
            count,
            panel,
            list
        } = getElements();


        if (
            !button ||
            !count ||
            !panel ||
            !list
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


            // =========================================
            // PEDIDOS PENDIENTES
            // =========================================

            const pendingOrders =
                orders.filter(
                    order =>

                        String(
                            order.status ||
                            ""
                        ).toLowerCase() ===
                        "pendiente"

                );


            // =========================================
            // CONTADOR
            // =========================================

            count.textContent =
                pendingOrders.length;


            if (
                pendingOrders.length === 0
            ) {

                count.style.display =
                    "none";

                button.classList.remove(
                    "has-notifications"
                );

            } else {

                count.style.display =
                    "flex";

                button.classList.add(
                    "has-notifications"
                );

            }


            // =========================================
            // SIN PEDIDOS
            // =========================================

            if (
                pendingOrders.length === 0
            ) {

                list.innerHTML = `

                    <div
                        class="notifications-empty"
                    >

                        <i
                            class="fa-solid fa-circle-check"
                        ></i>

                        <span>
                            No tienes pedidos pendientes.
                        </span>

                    </div>

                `;

                return;

            }


            // =========================================
            // MOSTRAR PEDIDOS
            // =========================================

            list.innerHTML =

                pendingOrders
                    .slice(0, 5)
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

        } catch (error) {

            console.error(
                "Error cargando notificaciones:",
                error
            );


            list.innerHTML = `

                <div
                    class="notifications-empty"
                >

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


    // =================================================
    // CONFIGURAR CAMPANA
    // =================================================

    function setupNotifications() {

        const {
            button,
            panel
        } = getElements();


        if (
            !button ||
            !panel
        ) {

            return;

        }


        // Evitar eventos duplicados

        if (
            button.dataset.notificationsReady ===
            "true"
        ) {

            return;

        }


        button.dataset.notificationsReady =
            "true";


        // =============================================
        // ABRIR / CERRAR
        // =============================================

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                panel.classList.toggle(
                    "show"
                );


                if (
                    panel.classList.contains(
                        "show"
                    )
                ) {

                    loadNotifications();

                }

            }
        );


        // =============================================
        // NO CERRAR DENTRO DEL PANEL
        // =============================================

        panel.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );


        // =============================================
        // CERRAR FUERA
        // =============================================

        document.addEventListener(
            "click",
            () => {

                panel.classList.remove(
                    "show"
                );

            }
        );


        // =============================================
        // PRIMERA CARGA
        // =============================================

        loadNotifications();


        // =============================================
        // ACTUALIZAR CADA 30 SEGUNDOS
        // =============================================

        setInterval(
            loadNotifications,
            30000
        );

    }


    // =================================================
    // INICIAR
    // =================================================

    function initialize() {

        setupNotifications();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();