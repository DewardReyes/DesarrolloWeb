const API_URL = "http://localhost:3000";

const SHIPPING_COST = 0;


// =====================================================
// PRODUCT ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const productId =
    params.get("id");


// =====================================================
// ELEMENTOS
// =====================================================

const productContainer =
    document.getElementById(
        "productContainer"
    );

const relatedProducts =
    document.getElementById(
        "relatedProducts"
    );

const cartOverlay =
    document.getElementById(
        "cartOverlay"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartSubtotal =
    document.getElementById(
        "cartSubtotal"
    );

const cartShipping =
    document.getElementById(
        "cartShipping"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const cartButton =
    document.getElementById(
        "cartButton"
    );

const closeCartButton =
    document.getElementById(
        "closeCart"
    );

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


// =====================================================
// MISMO CARRITO DE TODA LA TIENDA
// =====================================================

let cart =
    loadCart();


function loadCart() {

    try {

        const savedCart =
            JSON.parse(
                localStorage.getItem(
                    "smartphoneCart"
                ) || "[]"
            );


        if (
            Array.isArray(
                savedCart
            )
        ) {

            return savedCart;

        }


        return [];


    } catch (error) {

        console.error(
            "Error leyendo carrito:",
            error
        );

        return [];

    }

}


// =====================================================
// GUARDAR CARRITO
// =====================================================

function saveCart() {

    localStorage.setItem(

        "smartphoneCart",

        JSON.stringify(
            cart
        )

    );

}


// =====================================================
// CARGAR PRODUCTO
// =====================================================

async function loadProduct() {

    if (!productId) {

        showProductError(
            "No se especificó el producto."
        );

        return;

    }


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
                "Producto no encontrado."

            );

        }


        const product =
            data.product;


        if (!product) {

            throw new Error(
                "Producto no encontrado."
            );

        }


        renderProduct(
            product
        );


        loadRelatedProducts(
            product
        );


    } catch (error) {

        console.error(
            error
        );


        showProductError(
            error.message ||
            "No se pudo cargar el producto."
        );

    }

}


// =====================================================
// MOSTRAR PRODUCTO
// =====================================================

function renderProduct(
    product
) {

    document.title =
        `${product.brand} ${product.model} | SmartPhone RD`;


    const image =
        product.image

            ? `

                <img
                    src="${API_URL}${product.image}"
                    alt="${escapeHTML(
                        product.brand
                    )} ${escapeHTML(
                        product.model
                    )}"
                >

            `

            : `

                <i
                    class="fa-solid fa-mobile-screen"
                ></i>

            `;


    const badges = `

        ${
            Number(
                product.is_offer
            ) === 1

                ? `

                    <span
                        class="detail-badge offer-badge"
                    >
                        OFERTA
                    </span>

                `

                : ""
        }


        ${
            Number(
                product.is_featured
            ) === 1

                ? `

                    <span
                        class="detail-badge featured-badge"
                    >
                        DESTACADO
                    </span>

                `

                : ""
        }

    `;


    const stock =
        Number(
            product.stock || 0
        );


    let stockClass =
        "";

    let stockText =
        "";


    if (stock <= 0) {

        stockClass =
            "stock-out";

        stockText =
            "Agotado";

    } else if (stock <= 5) {

        stockClass =
            "stock-low";

        stockText =
            `Solo quedan ${stock} unidades`;

    } else {

        stockText =
            `${stock} unidades disponibles`;

    }


    const disabled =
        stock <= 0
            ? "disabled"
            : "";


    productContainer.innerHTML = `

        <!-- GALERÍA -->

        <div class="product-gallery">

            <div class="main-product-image">

                <div
                    class="detail-badges"
                >

                    ${badges}

                </div>


                ${image}

            </div>

        </div>


        <!-- INFORMACIÓN -->

        <div class="product-info-detail">


            <span
                class="detail-brand"
            >

                ${escapeHTML(
                    product.brand
                )}

            </span>


            <h1
                class="detail-title"
            >

                ${escapeHTML(
                    product.model
                )}

            </h1>


            ${
                product.description

                    ? `

                        <p
                            class="detail-description"
                        >

                            ${escapeHTML(
                                product.description
                            )}

                        </p>

                    `

                    : ""
            }


            <!-- PRECIO -->

            <div
                class="detail-price-box"
            >

                <strong
                    class="detail-price"
                >

                    ${formatPrice(
                        product.price
                    )}

                </strong>


                ${
                    product.old_price

                        ? `

                            <span
                                class="detail-old-price"
                            >

                                ${formatPrice(
                                    product.old_price
                                )}

                            </span>

                        `

                        : ""
                }

            </div>


            <!-- STOCK -->

            <div
                class="stock-info ${stockClass}"
            >

                <span
                    class="stock-dot"
                ></span>

                ${stockText}

            </div>


            <!-- ESPECIFICACIONES -->

            <div
                class="specifications"
            >


                <div
                    class="specification"
                >

                    <span
                        class="specification-label"
                    >
                        RAM
                    </span>

                    <strong
                        class="specification-value"
                    >

                        ${escapeHTML(
                            product.ram ||
                            "No especificado"
                        )}

                    </strong>

                </div>


                <div
                    class="specification"
                >

                    <span
                        class="specification-label"
                    >
                        Almacenamiento
                    </span>

                    <strong
                        class="specification-value"
                    >

                        ${escapeHTML(
                            product.storage ||
                            "No especificado"
                        )}

                    </strong>

                </div>


                <div
                    class="specification"
                >

                    <span
                        class="specification-label"
                    >
                        Color
                    </span>

                    <strong
                        class="specification-value"
                    >

                        ${escapeHTML(
                            product.color ||
                            "No especificado"
                        )}

                    </strong>

                </div>


                <div
                    class="specification"
                >

                    <span
                        class="specification-label"
                    >
                        Stock
                    </span>

                    <strong
                        class="specification-value"
                    >

                        ${stock}

                    </strong>

                </div>


            </div>


            <!-- COMPRA -->

            <div
                class="purchase-row"
            >


                <div
                    class="quantity-control"
                >

                    <button
                        type="button"
                        id="decreaseQuantity"
                        ${disabled}
                    >

                        <i
                            class="fa-solid fa-minus"
                        ></i>

                    </button>


                    <span
                        id="quantity"
                    >
                        1
                    </span>


                    <button
                        type="button"
                        id="increaseQuantity"
                        ${disabled}
                    >

                        <i
                            class="fa-solid fa-plus"
                        ></i>

                    </button>

                </div>


                <button
                    type="button"
                    class="add-product-cart"
                    id="addProductCart"
                    ${disabled}
                >

                    <i
                        class="fa-solid fa-cart-plus"
                    ></i>


                    ${
                        stock <= 0

                            ? "Producto agotado"

                            : "Agregar al carrito"
                    }

                </button>

            </div>


        </div>

    `;


    initializePurchase(
        product,
        stock
    );

}


// =====================================================
// CANTIDAD
// =====================================================

function initializePurchase(
    product,
    stock
) {

    const quantityElement =
        document.getElementById(
            "quantity"
        );


    const decreaseButton =
        document.getElementById(
            "decreaseQuantity"
        );


    const increaseButton =
        document.getElementById(
            "increaseQuantity"
        );


    const addButton =
        document.getElementById(
            "addProductCart"
        );


    if (
        !quantityElement ||
        !decreaseButton ||
        !increaseButton ||
        !addButton
    ) {

        return;

    }


    let quantity =
        1;


    decreaseButton.addEventListener(
        "click",
        () => {

            if (
                quantity > 1
            ) {

                quantity--;

                quantityElement.textContent =
                    quantity;

            }

        }
    );


    increaseButton.addEventListener(
        "click",
        () => {

            if (
                quantity < stock
            ) {

                quantity++;

                quantityElement.textContent =
                    quantity;

            }

        }
    );


    addButton.addEventListener(
        "click",
        () => {

            addToCart(
                product,
                quantity
            );

        }
    );

}


// =====================================================
// AGREGAR AL MISMO CARRITO
// =====================================================

function addToCart(
    product,
    quantity
) {

    cart =
        loadCart();


    const stock =
        Number(
            product.stock || 0
        );


    if (
        stock <= 0
    ) {

        alert(
            "Este producto está agotado."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                Number(item.id) ===
                Number(product.id)
        );


    const currentQuantity =
        existing
            ? Number(
                existing.quantity || 0
            )
            : 0;


    if (
        currentQuantity +
        quantity >
        stock
    ) {

        alert(
            `Solo hay ${stock} unidades disponibles.`
        );

        return;

    }


    if (existing) {

        existing.quantity =
            currentQuantity +
            quantity;


        existing.brand =
            product.brand;


        existing.model =
            product.model;


        existing.price =
            Number(
                product.price
            );


        existing.image =
            product.image;


        existing.stock =
            stock;


    } else {

        cart.push({

            id:
                product.id,

            brand:
                product.brand,

            model:
                product.model,

            price:
                Number(
                    product.price
                ),

            image:
                product.image,

            stock:
                stock,

            quantity:
                quantity

        });

    }


    saveCart();


    updateCart();


    openCart();

}


// =====================================================
// ACTUALIZAR CARRITO
// =====================================================

function updateCart() {

    cart = loadCart();


    // -------------------------------------------------
    // CONTADOR DEL CARRITO
    // -------------------------------------------------

    if (cartCount) {

        const count = cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        cartCount.textContent = count;
    }


    // -------------------------------------------------
    // VERIFICAR ELEMENTO
    // -------------------------------------------------

    if (!cartItems) {
        return;
    }


    // -------------------------------------------------
    // CARRITO VACÍO
    // -------------------------------------------------

    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <h3>
                    Tu carrito está vacío
                </h3>

                <p>
                    Agrega un celular para comenzar.
                </p>

            </div>

        `;


        updateSummary();


        if (checkoutButton) {
            checkoutButton.disabled = true;
        }


        return;
    }


    // -------------------------------------------------
    // MOSTRAR PRODUCTOS
    // -------------------------------------------------

    cartItems.innerHTML = cart.map(item => {

        const imageHTML = item.image

            ? `
                <img
                    src="${API_URL}${item.image}"
                    alt="${escapeHTML(item.brand)} ${escapeHTML(item.model)}"
                >
              `

            : `
                <i class="fa-solid fa-mobile-screen"></i>
              `;


        return `

            <div
                class="cart-product"
                data-product-id="${item.id}"
            >


                <!-- IMAGEN -->

                <div class="cart-product-image">

                    ${imageHTML}

                </div>



                <!-- INFORMACIÓN -->

                <div class="cart-product-info">


                    <span class="cart-product-brand">

                        ${escapeHTML(item.brand)}

                    </span>


                    <span class="cart-product-name">

                        ${escapeHTML(item.model)}

                    </span>


                    <strong class="cart-product-price">

                        ${formatPrice(
                            Number(item.price)
                        )}

                    </strong>



                    <!-- CANTIDAD -->

                    <div class="cart-quantity">


                        <button
                            type="button"
                            class="cart-minus"
                            data-id="${item.id}"
                            title="Disminuir cantidad"
                        >

                            <i class="fa-solid fa-minus"></i>

                        </button>


                        <span>

                            ${Number(item.quantity || 0)}

                        </span>


                        <button
                            type="button"
                            class="cart-plus"
                            data-id="${item.id}"
                            title="Aumentar cantidad"
                        >

                            <i class="fa-solid fa-plus"></i>

                        </button>


                    </div>


                </div>



                <!-- ELIMINAR -->

                <button
                    type="button"
                    class="remove-cart-item"
                    data-id="${item.id}"
                    title="Eliminar producto"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>


            </div>

        `;

    }).join("");


    // -------------------------------------------------
    // ACTUALIZAR RESUMEN
    // -------------------------------------------------

    updateSummary();


    if (checkoutButton) {

        checkoutButton.disabled = false;

    }

}

// =====================================================
// ACCIONES DEL CARRITO
// =====================================================

if (cartItems) {

    cartItems.addEventListener("click", function (event) {


        // -------------------------------------------------
        // ELIMINAR PRODUCTO
        // -------------------------------------------------

        const removeButton =
            event.target.closest(".remove-cart-item");


        if (removeButton) {

            const productId =
                Number(
                    removeButton.dataset.id
                );


            cart = loadCart();


            cart = cart.filter(
                item =>
                    Number(item.id) !== productId
            );


            saveCart();


            updateCart();

            return;
        }



        // -------------------------------------------------
        // DISMINUIR CANTIDAD
        // -------------------------------------------------

        const minusButton =
            event.target.closest(".cart-minus");


        if (minusButton) {

            const productId =
                Number(
                    minusButton.dataset.id
                );


            cart = loadCart();


            const item =
                cart.find(
                    product =>
                        Number(product.id) === productId
                );


            if (item) {

                const quantity =
                    Number(item.quantity || 0);


                if (quantity > 1) {

                    item.quantity =
                        quantity - 1;

                } else {

                    cart =
                        cart.filter(
                            product =>
                                Number(product.id) !==
                                productId
                        );

                }


                saveCart();

                updateCart();

            }


            return;
        }



        // -------------------------------------------------
        // AUMENTAR CANTIDAD
        // -------------------------------------------------

        const plusButton =
            event.target.closest(".cart-plus");


        if (plusButton) {

            const productId =
                Number(
                    plusButton.dataset.id
                );


            cart = loadCart();


            const item =
                cart.find(
                    product =>
                        Number(product.id) === productId
                );


            if (item) {

                const stock =
                    Number(item.stock || 0);

                const quantity =
                    Number(item.quantity || 0);


                if (quantity < stock) {

                    item.quantity =
                        quantity + 1;

                    saveCart();

                    updateCart();

                } else {

                    alert(
                        `Solo hay ${stock} unidades disponibles.`
                    );

                }

            }


            return;
        }

    });

}

// =====================================================
// VACIAR CARRITO
// =====================================================

const clearCartButton =
    document.getElementById(
        "clearCartButton"
    );


if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function () {


            cart = loadCart();


            if (!cart.length) {

                return;

            }


            const confirmClear =
                confirm(
                    "¿Seguro que quieres vaciar el carrito?"
                );


            if (!confirmClear) {

                return;

            }


            cart = [];


            saveCart();


            updateCart();

        }
    );

}
// =====================================================
// RESUMEN
// =====================================================

function updateSummary() {

    const subtotal =
        cart.reduce(

            (
                total,
                item
            ) =>

                total +

                (
                    Number(
                        item.price || 0
                    ) *

                    Number(
                        item.quantity || 0
                    )
                ),

            0

        );


    const shipping =
        cart.length
            ? SHIPPING_COST
            : 0;


    const total =
        subtotal +
        shipping;


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatPrice(
                subtotal
            );

    }


    if (cartShipping) {

        cartShipping.textContent =
            shipping > 0
                ? formatPrice(
                    shipping
                )
                : "Gratis";

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatPrice(
                total
            );

    }

}


// =====================================================
// ABRIR CARRITO
// =====================================================

if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


// =====================================================
// CERRAR CARRITO
// =====================================================

if (closeCartButton) {

    closeCartButton.addEventListener(
        "click",
        closeCart
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                cartOverlay
            ) {

                closeCart();

            }

        }
    );

}


function openCart() {

    if (cartOverlay) {

        cartOverlay.classList.add(
            "open"
        );

    }

}


function closeCart() {

    if (cartOverlay) {

        cartOverlay.classList.remove(
            "open"
        );

    }

}


// =====================================================
// CONTINUAR COMPRA
// =====================================================

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        () => {

            cart =
                loadCart();


            if (
                !cart.length
            ) {

                alert(
                    "Tu carrito está vacío."
                );

                return;

            }


            window.location.href =
                "checkout.html";

        }
    );

}


// =====================================================
// PRODUCTOS RELACIONADOS
// =====================================================

async function loadRelatedProducts(
    currentProduct
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        if (!response.ok) {

            return;

        }


        let products =

            (
                data.products ||
                []
            )

            .filter(
                product =>
                    Number(
                        product.id
                    ) !==
                    Number(
                        currentProduct.id
                    )
            )

            .filter(
                product =>
                    product.brand ===
                    currentProduct.brand
            )

            .slice(
                0,
                4
            );


        if (
            !products.length
        ) {

            products =

                (
                    data.products ||
                    []
                )

                .filter(
                    product =>
                        Number(
                            product.id
                        ) !==
                        Number(
                            currentProduct.id
                        )
                )

                .slice(
                    0,
                    4
                );

        }


        if (
            !products.length
        ) {

            relatedProducts.innerHTML = `

                <div
                    class="product-loading"
                >

                    No hay productos relacionados.

                </div>

            `;

            return;

        }


        relatedProducts.innerHTML =

            products
                .map(
                    product =>
                        createRelatedCard(
                            product
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "Error cargando productos relacionados:",
            error
        );

    }

}


// =====================================================
// TARJETA RELACIONADA
// =====================================================

function createRelatedCard(
    product
) {

    const image =
        product.image

            ? `

                <img
                    src="${API_URL}${product.image}"
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

        <a
            href="producto.html?id=${product.id}"
            class="related-card"
        >

            <div
                class="related-image"
            >

                ${image}

            </div>


            <div
                class="related-info"
            >

                <span
                    class="related-brand"
                >

                    ${escapeHTML(
                        product.brand
                    )}

                </span>


                <h3
                    class="related-name"
                >

                    ${escapeHTML(
                        product.model
                    )}

                </h3>


                <strong
                    class="related-price"
                >

                    ${formatPrice(
                        product.price
                    )}

                </strong>

            </div>

        </a>

    `;

}


// =====================================================
// ERROR
// =====================================================

function showProductError(
    message
) {

    if (!productContainer) {

        return;

    }


    productContainer.innerHTML = `

        <div
            class="product-loading"
        >

            <i
                class="fa-solid fa-triangle-exclamation"
            ></i>

            ${escapeHTML(
                message
            )}

        </div>

    `;

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

        Number(
            price
        ) || 0

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


// =====================================================
// INICIAR
// =====================================================

updateCart();

loadProduct();