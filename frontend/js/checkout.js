const API_URL = "http://localhost:3000";


// =====================================================
// CONFIGURACIÓN
// =====================================================

const SHIPPING_COST = 250;


// =====================================================
// CARRITO
// =====================================================

let cart = JSON.parse(
    localStorage.getItem("smartphoneCart") || "[]"
);


// =====================================================
// ELEMENTOS
// =====================================================

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const summaryProducts =
    document.getElementById(
        "summaryProducts"
    );

const summaryCount =
    document.getElementById(
        "summaryCount"
    );

const summarySubtotal =
    document.getElementById(
        "summarySubtotal"
    );

const summaryShipping =
    document.getElementById(
        "summaryShipping"
    );

const summaryTotal =
    document.getElementById(
        "summaryTotal"
    );

const submitOrder =
    document.getElementById(
        "submitOrder"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


// =====================================================
// VERIFICAR CARRITO
// =====================================================

if (!cart.length) {

    showMessage(
        "Tu carrito está vacío. Agrega un producto antes de continuar.",
        "error"
    );


    if (submitOrder) {

        submitOrder.disabled =
            true;

    }

} else {

    renderSummary();

}


// =====================================================
// MOSTRAR RESUMEN
// =====================================================

function renderSummary() {

    const totalProducts =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );


    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    const shipping =
        SHIPPING_COST;


    const total =
        subtotal +
        shipping;


    if (summaryCount) {

        summaryCount.textContent =
            `${totalProducts} ${
                totalProducts === 1
                    ? "producto"
                    : "productos"
            }`;

    }


    if (summarySubtotal) {

        summarySubtotal.textContent =
            formatPrice(
                subtotal
            );

    }


    if (summaryShipping) {

        summaryShipping.textContent =
            formatPrice(
                shipping
            );

    }


    if (summaryTotal) {

        summaryTotal.textContent =
            formatPrice(
                total
            );

    }


    if (!summaryProducts) {
        return;
    }


    summaryProducts.innerHTML =
        cart
            .map(
                item => {

                    const image =
                        item.image

                            ? `

                                <img
                                    src="${API_URL}${item.image}"
                                    alt="${escapeHTML(
                                        item.model
                                    )}"
                                >

                            `

                            : `

                                <i
                                    class="fa-solid fa-mobile-screen"
                                ></i>

                            `;


                    return `

                        <div
                            class="summary-product"
                        >

                            <div
                                class="summary-image"
                            >

                                ${image}

                            </div>


                            <div
                                class="summary-info"
                            >

                                <strong>

                                    ${escapeHTML(
                                        item.brand
                                    )}

                                    ${escapeHTML(
                                        item.model
                                    )}

                                </strong>


                                <span>

                                    Cantidad:
                                    ${item.quantity}

                                </span>


                                <span
                                    class="summary-price"
                                >

                                    ${formatPrice(
                                        item.price *
                                        item.quantity
                                    )}

                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// ENVIAR PEDIDO
// =====================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!cart.length) {

                showMessage(
                    "Tu carrito está vacío.",
                    "error"
                );

                return;

            }


            const formData =
                new FormData(
                    checkoutForm
                );


            const customer = {

                name:
                    formData.get(
                        "name"
                    ),

                phone:
                    formData.get(
                        "phone"
                    ),

                email:
                    formData.get(
                        "email"
                    ),

                province:
                    formData.get(
                        "province"
                    ),

                city:
                    formData.get(
                        "city"
                    ),

                address:
                    formData.get(
                        "address"
                    ),

                reference:
                    formData.get(
                        "reference"
                    ),

                payment_method:
                    formData.get(
                        "payment_method"
                    )

            };


            const order = {

                customer,

                products:
                    cart.map(
                        item => ({

                            product_id:
                                item.id,

                            quantity:
                                item.quantity,

                            price:
                                item.price

                        })
                    )

            };


            try {

                submitOrder.disabled =
                    true;


                submitOrder.innerHTML = `

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    Procesando pedido...

                `;


                const response =
                    await fetch(
                        `${API_URL}/api/orders`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    order
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "No se pudo crear el pedido."
                    );

                }


                localStorage.removeItem(
                    "smartphoneCart"
                );


                showMessage(
                    "¡Pedido realizado correctamente!",
                    "success"
                );


                submitOrder.innerHTML = `

                    <i
                        class="fa-solid fa-check"
                    ></i>

                    Pedido realizado

                `;


                setTimeout(
                    () => {

                        window.location.href =
                            "pedido-confirmado.html?id=" +
                            data.orderId;

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );


                submitOrder.disabled =
                    false;


                submitOrder.innerHTML = `

                    <i
                        class="fa-solid fa-check"
                    ></i>

                    Confirmar pedido

                `;

            }

        }
    );

}


// =====================================================
// MENSAJE
// =====================================================

function showMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;

}


// =====================================================
// PRECIO
// =====================================================

function formatPrice(
    price
) {

    return new Intl.NumberFormat(
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
        Number(price) || 0
    );

}


// =====================================================
// SEGURIDAD
// =====================================================

function escapeHTML(
    value
) {

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