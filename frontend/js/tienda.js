const API_URL = "http://localhost:3000";


// =====================================================
// VARIABLES
// =====================================================

let allProducts = [];

let cart = JSON.parse(
    localStorage.getItem("smartphoneCart") || "[]"
);


// =====================================================
// ELEMENTOS
// =====================================================

const productsGrid =
    document.getElementById("productsGrid");

const offersGrid =
    document.getElementById("offersGrid");

const featuredGrid =
    document.getElementById("featuredGrid");

const productSearch =
    document.getElementById("productSearch");

const brandFilter =
    document.getElementById("brandFilter");

const cartCount =
    document.getElementById("cartCount");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartShipping =
    document.getElementById("cartShipping");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

const clearCartButton =
    document.getElementById("clearCartButton");


// =====================================================
// CONFIGURACIÓN
// =====================================================

const SHIPPING_COST = 250;


// =====================================================
// CARGAR PRODUCTOS
// =====================================================

async function loadProducts() {

    try {

        console.log(
            "Cargando productos..."
        );


        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No se pudieron cargar los productos."
            );

        }


        allProducts =
            data.products || [];


        populateBrands();

        renderProducts(
            allProducts
        );

        renderOffers();

        renderFeatured();


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );


        showError(
            productsGrid,
            "No se pudieron cargar los productos."
        );

    }

}


// =====================================================
// MARCAS
// =====================================================

function populateBrands() {

    if (!brandFilter) {

        return;

    }


    const brands =
        [
            ...new Set(

                allProducts
                    .map(
                        product =>
                            product.brand
                    )
                    .filter(Boolean)

            )
        ]
        .sort();


    brandFilter.innerHTML = `

        <option value="">
            Todas las marcas
        </option>

        ${
            brands
                .map(
                    brand => `

                        <option
                            value="${escapeHTML(
                                brand
                            )}"
                        >

                            ${escapeHTML(
                                brand
                            )}

                        </option>

                    `
                )
                .join("")
        }

    `;

}


// =====================================================
// PRODUCTOS
// =====================================================

function renderProducts(
    products
) {

    if (!productsGrid) {

        return;

    }


    if (!products.length) {

        productsGrid.innerHTML = `

            <div class="products-loading">

                <i
                    class="fa-solid fa-box-open"
                ></i>

                No hay productos disponibles.

            </div>

        `;


        return;

    }


    productsGrid.innerHTML =
        products
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");

}


// =====================================================
// OFERTAS
// =====================================================

function renderOffers() {

    if (!offersGrid) {

        return;

    }


    const offers =
        allProducts.filter(
            product =>
                Number(
                    product.is_offer
                ) === 1
        );


    if (!offers.length) {

        offersGrid.innerHTML = `

            <div class="products-loading">

                <i
                    class="fa-solid fa-tags"
                ></i>

                No hay ofertas disponibles.

            </div>

        `;


        return;

    }


    offersGrid.innerHTML =
        offers
            .slice(0, 4)
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");

}


// =====================================================
// DESTACADOS
// =====================================================

function renderFeatured() {

    if (!featuredGrid) {

        return;

    }


    const featured =
        allProducts.filter(
            product =>
                Number(
                    product.is_featured
                ) === 1
        );


    if (!featured.length) {

        featuredGrid.innerHTML = `

            <div class="products-loading">

                <i
                    class="fa-solid fa-star"
                ></i>

                No hay productos destacados.

            </div>

        `;


        return;

    }


    featuredGrid.innerHTML =
        featured
            .slice(0, 4)
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");

}


// =====================================================
// TARJETA DE PRODUCTO
// =====================================================

function createProductCard(
    product
) {

    const imageHTML =
        product.image

            ? `

                <img
                    src="${API_URL}${product.image}"
                    alt="${escapeHTML(
                        product.brand
                    )} ${escapeHTML(
                        product.model
                    )}"
                    loading="lazy"
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
                        class="badge badge-offer"
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
                        class="badge badge-featured"
                    >

                        DESTACADO

                    </span>

                `

                : ""
        }

    `;


    const specifications = [

        product.ram,

        product.storage,

        product.color

    ].filter(Boolean);


    const specsHTML =
        specifications
            .map(
                spec => `

                    <span
                        class="product-spec"
                    >

                        ${escapeHTML(
                            spec
                        )}

                    </span>

                `
            )
            .join("");


    return `

        <article
            class="product-card"
            onclick="openProduct(${product.id})"
            style="cursor:pointer;"
        >

            <div
                class="product-badges"
            >

                ${badges}

            </div>


            <div
                class="product-image"
            >

                ${imageHTML}

            </div>


            <div
                class="product-info"
            >

                <span
                    class="product-brand"
                >

                    ${escapeHTML(
                        product.brand
                    )}

                </span>


                <h3
                    class="product-name"
                >

                    ${escapeHTML(
                        product.model
                    )}

                </h3>


                <div
                    class="product-specs"
                >

                    ${specsHTML}

                </div>


                <div
                    class="product-bottom"
                >

                    <div
                        class="product-price"
                    >

                        <strong
                            class="current-price"
                        >

                            ${formatPrice(
                                product.price
                            )}

                        </strong>


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

                    </div>


                    <button
                        type="button"
                        class="add-cart"
                        onclick="event.stopPropagation(); addToCart(${product.id})"
                    >

                        <i
                            class="fa-solid fa-cart-plus"
                        ></i>

                    </button>

                </div>

            </div>

        </article>

    `;

}


// =====================================================
// ABRIR PRODUCTO
// =====================================================

function openProduct(
    id
) {

    window.location.href =
        `pages/producto.html?id=${id}`;

}


// =====================================================
// BUSCAR
// =====================================================

if (productSearch) {

    productSearch.addEventListener(
        "input",
        filterProducts
    );

}


if (brandFilter) {

    brandFilter.addEventListener(
        "change",
        filterProducts
    );

}


function filterProducts() {

    const search =
        productSearch
            ? productSearch.value
                .toLowerCase()
                .trim()
            : "";


    const brand =
        brandFilter
            ? brandFilter.value
            : "";


    const filtered =
        allProducts.filter(
            product => {

                const name =
                    `${product.brand} ${product.model}`
                        .toLowerCase();


                return (

                    (!search ||
                        name.includes(
                            search
                        ))

                    &&

                    (!brand ||
                        product.brand ===
                        brand)

                );

            }
        );


    renderProducts(
        filtered
    );

}


// =====================================================
// AGREGAR AL CARRITO
// =====================================================

function addToCart(
    productId
) {

    const product =
        allProducts.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            "Producto no encontrado."
        );

        return;

    }


    const stock =
        Number(
            product.stock || 0
        );


    if (stock <= 0) {

        alert(
            "Este producto está agotado."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (existing) {

        if (
            existing.quantity >=
            stock
        ) {

            alert(
                "No hay más unidades disponibles."
            );

            return;

        }


        existing.quantity++;

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
                1

        });

    }


    saveCart();

    updateCart();

    openCart();

}


// =====================================================
// CAMBIAR CANTIDAD
// =====================================================

function changeCartQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!item) {

        return;

    }


    const newQuantity =
        item.quantity +
        change;


    if (newQuantity <= 0) {

        removeFromCart(
            productId
        );

        return;

    }


    if (
        item.stock &&
        newQuantity >
        item.stock
    ) {

        alert(
            "No hay suficiente stock disponible."
        );

        return;

    }


    item.quantity =
        newQuantity;


    saveCart();

    updateCart();

}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );


    saveCart();

    updateCart();

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
// ACTUALIZAR CARRITO
// =====================================================

function updateCart() {

    if (cartCount) {

        const count =
            cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.quantity,
                0
            );


        cartCount.textContent =
            count;

    }


    if (!cartItems) {

        return;

    }


    if (!cart.length) {

        cartItems.innerHTML = `

            <div
                class="empty-cart"
            >

                <i
                    class="fa-solid fa-cart-shopping"
                ></i>

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

            checkoutButton.disabled =
                true;

        }


        return;

    }


    cartItems.innerHTML =
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
                            class="cart-product"
                        >

                            <div
                                class="cart-product-image"
                            >

                                ${image}

                            </div>


                            <div
                                class="cart-product-info"
                            >

                                <span
                                    class="cart-product-brand"
                                >

                                    ${escapeHTML(
                                        item.brand
                                    )}

                                </span>


                                <strong
                                    class="cart-product-name"
                                >

                                    ${escapeHTML(
                                        item.model
                                    )}

                                </strong>


                                <strong
                                    class="cart-product-price"
                                >

                                    ${formatPrice(
                                        item.price
                                    )}

                                </strong>


                                <div
                                    class="cart-quantity"
                                >

                                    <button
                                        type="button"
                                        onclick="changeCartQuantity(${item.id}, -1)"
                                    >

                                        <i
                                            class="fa-solid fa-minus"
                                        ></i>

                                    </button>


                                    <span>
                                        ${item.quantity}
                                    </span>


                                    <button
                                        type="button"
                                        onclick="changeCartQuantity(${item.id}, 1)"
                                    >

                                        <i
                                            class="fa-solid fa-plus"
                                        ></i>

                                    </button>

                                </div>

                            </div>


                            <button
                                type="button"
                                class="remove-cart-item"
                                onclick="removeFromCart(${item.id})"
                                title="Eliminar"
                            >

                                <i
                                    class="fa-solid fa-trash"
                                ></i>

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    updateSummary();


    if (checkoutButton) {

        checkoutButton.disabled =
            false;

    }

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
                    Number(item.price) *
                    Number(item.quantity)
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
            shipping
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

const cartButton =
    document.getElementById(
        "cartButton"
    );


if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


function openCart() {

    if (!cartOverlay) {

        return;

    }


    cartOverlay.classList.add(
        "open"
    );

}


// =====================================================
// CERRAR CARRITO
// =====================================================

const closeCart =
    document.getElementById(
        "closeCart"
    );


if (closeCart) {

    closeCart.addEventListener(
        "click",
        () => {

            if (!cartOverlay) {

                return;

            }


            cartOverlay.classList.remove(
                "open"
            );

        }
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

                cartOverlay.classList.remove(
                    "open"
                );

            }

        }
    );

}


// =====================================================
// VACIAR CARRITO
// =====================================================

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        () => {

            if (!cart.length) {

                return;

            }


            const confirmed =
                confirm(
                    "¿Seguro que quieres vaciar el carrito?"
                );


            if (!confirmed) {

                return;

            }


            cart = [];


            saveCart();

            updateCart();

        }
    );

}


// =====================================================
// CHECKOUT
// =====================================================

if (checkoutButton) {

    console.log(
        "✅ BOTÓN CHECKOUT ENCONTRADO"
    );


    checkoutButton.addEventListener(
        "click",
        function () {

            console.log(
                "🔥 SE HIZO CLICK EN CHECKOUT"
            );


            const currentCart =
                JSON.parse(
                    localStorage.getItem(
                        "smartphoneCart"
                    ) || "[]"
                );


            console.log(
                "Carrito actual:",
                currentCart
            );


            if (
                !Array.isArray(
                    currentCart
                ) ||
                currentCart.length === 0
            ) {

                alert(
                    "Tu carrito está vacío."
                );

                return;

            }


            /*
             * Usamos location.href para llevar
             * al cliente a la página de checkout.
             */

            window.location.href =
                "./pages/checkout.html";

        }
    );

} else {

    console.error(
        "❌ NO SE ENCONTRÓ #checkoutButton"
    );

}


// =====================================================
// BOTÓN DE BÚSQUEDA
// =====================================================

const searchButton =
    document.getElementById(
        "searchButton"
    );


if (searchButton) {

    searchButton.addEventListener(
        "click",
        () => {

            if (productSearch) {

                productSearch.focus();

            }


            document
                .getElementById(
                    "productos"
                )
                ?.scrollIntoView({

                    behavior:
                        "smooth"

                });

        }
    );

}


// =====================================================
// FORMATEAR PRECIO
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


// =====================================================
// ERROR
// =====================================================

function showError(
    container,
    message
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div
            class="products-loading"
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
// INICIAR
// =====================================================

console.log(
    "✅ tienda.js cargado"
);


updateCart();


loadProducts();


console.log(
    "✅ tienda.js terminó de inicializar"
);