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

const offersGrid =
    document.getElementById(
        "offersGrid"
    );


const totalProductsElement =
    document.getElementById(
        "totalProducts"
    );


const totalOffersElement =
    document.getElementById(
        "totalOffers"
    );


const totalFeaturedElement =
    document.getElementById(
        "totalFeatured"
    );


const averageDiscountElement =
    document.getElementById(
        "averageDiscount"
    );


const offersSearch =
    document.getElementById(
        "offersSearch"
    );


const globalSearch =
    document.getElementById(
        "globalSearch"
    );


const offerFilter =
    document.getElementById(
        "offerFilter"
    );


const statusFilter =
    document.getElementById(
        "statusFilter"
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
// INFORMACIÓN DEL ADMIN
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
// OBTENER BOOLEAN
// =====================================================

function isTrue(value) {

    return (
        value === true ||
        value === 1 ||
        value === "1" ||
        value === "true"
    );

}


// =====================================================
// CALCULAR DESCUENTO
// =====================================================

function calculateDiscount(
    oldPrice,
    currentPrice
) {

    const oldValue =
        Number(oldPrice || 0);


    const currentValue =
        Number(currentPrice || 0);


    if (
        oldValue <= 0 ||
        currentValue <= 0 ||
        currentValue >= oldValue
    ) {

        return 0;

    }


    return Math.round(
        (
            (
                oldValue -
                currentValue
            )
            /
            oldValue
        ) * 100
    );

}


// =====================================================
// CARGAR PRODUCTOS
// =====================================================

async function loadProducts() {

    try {

        offersGrid.innerHTML = `

            <div class="offers-loading">

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                <span>
                    Cargando productos...
                </span>

            </div>

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
            "Error cargando productos:",
            error
        );


        offersGrid.innerHTML = `

            <div class="offers-error">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <span>
                    No se pudieron cargar los productos.
                </span>

            </div>

        `;

    }

}


// =====================================================
// ESTADÍSTICAS
// =====================================================

function updateStatistics() {

    const totalProducts =
        products.length;


    const totalOffers =
        products.filter(
            product =>
                isTrue(
                    product.is_offer
                )
        ).length;


    const totalFeatured =
        products.filter(
            product =>
                isTrue(
                    product.is_featured
                )
        ).length;


    const discounts =
        products
            .filter(
                product =>
                    isTrue(
                        product.is_offer
                    )
            )
            .map(
                product =>
                    calculateDiscount(
                        product.old_price,
                        product.price
                    )
            )
            .filter(
                discount =>
                    discount > 0
            );


    let averageDiscount = 0;


    if (discounts.length) {

        averageDiscount =
            Math.round(
                discounts.reduce(
                    (
                        total,
                        discount
                    ) =>
                        total + discount,
                    0
                )
                /
                discounts.length
            );

    }


    if (totalProductsElement) {

        totalProductsElement.textContent =
            totalProducts;

    }


    if (totalOffersElement) {

        totalOffersElement.textContent =
            totalOffers;

    }


    if (totalFeaturedElement) {

        totalFeaturedElement.textContent =
            totalFeatured;

    }


    if (averageDiscountElement) {

        averageDiscountElement.textContent =
            `${averageDiscount}%`;

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
// IMAGEN
// =====================================================

function getImage(
    product
) {

    const image =
        product.image ||
        product.image_url ||
        "";


    if (!image) {

        return "";

    }


    if (
        image.startsWith("/")
    ) {

        return `${API_URL}${image}`;

    }


    return image;

}


// =====================================================
// CREAR IMAGEN
// =====================================================

function createImage(
    product
) {

    const image =
        getImage(product);


    if (!image) {

        return `

            <div
                class="offer-image-placeholder"
            >

                <i
                    class="fa-solid fa-mobile-screen"
                ></i>

            </div>

        `;

    }


    return `

        <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(
                `${product.brand || ""} ${product.model || ""}`
            )}"
            onerror="
                this.style.display='none';
                this.parentElement.innerHTML='<div class=&quot;offer-image-placeholder&quot;><i class=&quot;fa-solid fa-mobile-screen&quot;></i></div>';
            "
        >

    `;

}


// =====================================================
// CREAR TARJETA
// =====================================================

function createProductCard(
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


    const oldPrice =
        Number(
            product.old_price || 0
        );


    const isOffer =
        isTrue(
            product.is_offer
        );


    const isFeatured =
        isTrue(
            product.is_featured
        );


    const isActive =
        (
            product.status ||
            "active"
        ) === "active";


    const stock =
        Number(
            product.stock || 0
        );


    const discount =
        calculateDiscount(
            oldPrice,
            price
        );


    const hasDiscount =
        isOffer &&
        discount > 0;


    return `

        <article
            class="
                offer-card
                ${!isActive ? "inactive" : ""}
            "
            data-id="${escapeHTML(id)}"
        >


            <!-- IMAGEN -->

            <div class="offer-image">


                ${
                    isOffer
                        ? `
                            <span class="offer-badge">

                                <i
                                    class="fa-solid fa-fire"
                                ></i>

                                OFERTA

                            </span>
                        `
                        : ""
                }


                ${
                    isFeatured
                        ? `
                            <span
                                class="featured-badge"
                                title="Producto destacado"
                            >

                                <i
                                    class="fa-solid fa-star"
                                ></i>

                            </span>
                        `
                        : ""
                }


                ${createImage(product)}


            </div>



            <!-- CONTENIDO -->

            <div class="offer-content">


                <span class="offer-brand">

                    ${escapeHTML(
                        brand
                    )}

                </span>


                <h2 class="offer-name">

                    ${escapeHTML(
                        model
                    )}

                </h2>



                <!-- PRECIO -->

                <div class="offer-price">


                    ${
                        hasDiscount
                            ? `

                                <span
                                    class="current-price"
                                >

                                    ${formatCurrency(
                                        price
                                    )}

                                </span>


                                <span
                                    class="old-price"
                                >

                                    ${formatCurrency(
                                        oldPrice
                                    )}

                                </span>


                                <span
                                    class="discount-percent"
                                >

                                    -${discount}%

                                </span>

                            `
                            : `

                                <span
                                    class="normal-price"
                                >

                                    ${formatCurrency(
                                        price
                                    )}

                                </span>

                            `
                    }


                </div>



                <!-- META -->

                <div class="offer-meta">


                    <span
                        class="offer-stock"
                    >

                        <i
                            class="fa-solid fa-box"
                        ></i>

                        Stock:

                        <strong>
                            ${stock}
                        </strong>

                    </span>


                    <span
                        class="
                            offer-status
                            ${isActive
                                ? "active"
                                : "inactive"}
                        "
                    >

                        ${
                            isActive
                                ? "Activo"
                                : "Inactivo"
                        }

                    </span>


                </div>


            </div>



            <!-- CONTROLES -->

            <div class="offer-controls">


                <!-- OFERTA -->

                <button
                    type="button"
                    class="
                        offer-control-btn
                        offer-button
                        ${isOffer ? "active" : ""}
                    "
                    data-action="offer"
                    data-id="${escapeHTML(id)}"
                >

                    <i
                        class="
                            fa-solid
                            ${
                                isOffer
                                    ? "fa-fire"
                                    : "fa-tag"
                            }
                        "
                    ></i>


                    ${
                        isOffer
                            ? "Oferta activa"
                            : "Activar oferta"
                    }

                </button>



                <!-- DESTACADO -->

                <button
                    type="button"
                    class="
                        offer-control-btn
                        featured-button
                        ${isFeatured ? "active" : ""}
                    "
                    data-action="featured"
                    data-id="${escapeHTML(id)}"
                >

                    <i
                        class="
                            fa-solid
                            ${
                                isFeatured
                                    ? "fa-star"
                                    : "fa-star"
                            }
                        "
                    ></i>


                    ${
                        isFeatured
                            ? "Destacado"
                            : "Destacar"
                    }

                </button>


            </div>


        </article>

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

        offersGrid.innerHTML = `

            <div class="offers-empty">

                <i
                    class="fa-solid fa-box-open"
                ></i>

                <span>
                    No hay productos que coincidan.
                </span>

            </div>

        `;


        updateProductsCount(
            0
        );

        return;

    }


    offersGrid.innerHTML =
        productsToRender
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");


    updateProductsCount(
        productsToRender.length
    );

}


// =====================================================
// FILTRAR
// =====================================================

function filterProducts() {

    const search =
        String(
            offersSearch?.value || ""
        )
        .trim()
        .toLowerCase();


    const selectedOfferFilter =
        offerFilter?.value ||
        "all";


    const selectedStatusFilter =
        statusFilter?.value ||
        "all";


    const filtered =
        products.filter(
            product => {


                // -----------------------------------------
                // BÚSQUEDA
                // -----------------------------------------

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


                // -----------------------------------------
                // FILTRO OFERTA
                // -----------------------------------------

                const isOffer =
                    isTrue(
                        product.is_offer
                    );


                const isFeatured =
                    isTrue(
                        product.is_featured
                    );


                if (
                    selectedOfferFilter ===
                    "offers"
                ) {

                    if (!isOffer) {

                        return false;

                    }

                }


                if (
                    selectedOfferFilter ===
                    "no-offers"
                ) {

                    if (isOffer) {

                        return false;

                    }

                }


                if (
                    selectedOfferFilter ===
                    "featured"
                ) {

                    if (!isFeatured) {

                        return false;

                    }

                }


                // -----------------------------------------
                // FILTRO ESTADO
                // -----------------------------------------

                const status =
                    product.status ||
                    "active";


                if (
                    selectedStatusFilter !==
                    "all" &&
                    status !==
                    selectedStatusFilter
                ) {

                    return false;

                }


                return true;

            }
        );


    renderProducts(
        filtered
    );

}


// =====================================================
// ACTUALIZAR PRODUCTO
// =====================================================

async function updateProduct(
    productId,
    changes
) {

    /*
        Esta función intenta actualizar
        el producto utilizando PUT.

        La ruta esperada es:

        PUT /api/products/:id
    */


    const response =
        await fetch(
            `${API_URL}/api/products/${productId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify(
                        changes
                    )

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            "No se pudo actualizar el producto."

        );

    }


    return data;

}


// =====================================================
// ACTIVAR / DESACTIVAR OFERTA
// =====================================================

async function toggleOffer(
    productId
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        return;

    }


    const currentlyOffer =
        isTrue(
            product.is_offer
        );


    /*
        Si ya está en oferta,
        la desactivamos.
    */

    if (currentlyOffer) {

        await updateProduct(
            productId,
            {

                is_offer: 0

            }
        );


        product.is_offer =
            0;


        updateStatistics();


        filterProducts();


        return;

    }


    /*
        Si no está en oferta,
        pedimos el precio anterior.
    */

    const currentPrice =
        Number(
            product.price || 0
        );


    const suggestedOldPrice =
        Number(
            product.old_price ||
            currentPrice
        );


    const oldPriceInput =
        prompt(

            "Escribe el precio anterior del producto:",

            suggestedOldPrice

        );


    if (
        oldPriceInput === null
    ) {

        return;

    }


    const oldPrice =
        Number(
            oldPriceInput
        );


    if (
        !Number.isFinite(oldPrice) ||
        oldPrice <= 0
    ) {

        alert(
            "El precio anterior no es válido."
        );

        return;

    }


    if (
        oldPrice <= currentPrice
    ) {

        alert(

            "El precio anterior debe ser mayor que el precio actual."

        );

        return;

    }


    try {

        await updateProduct(
            productId,
            {

                old_price:
                    oldPrice,

                is_offer:
                    1

            }
        );


        product.old_price =
            oldPrice;


        product.is_offer =
            1;


        updateStatistics();


        filterProducts();


        alert(
            "Oferta activada correctamente."
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================================
// ACTIVAR / DESACTIVAR DESTACADO
// =====================================================

async function toggleFeatured(
    productId
) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        return;

    }


    const currentlyFeatured =
        isTrue(
            product.is_featured
        );


    try {

        await updateProduct(
            productId,
            {

                is_featured:
                    currentlyFeatured
                        ? 0
                        : 1

            }
        );


        product.is_featured =
            currentlyFeatured
                ? 0
                : 1;


        updateStatistics();


        filterProducts();


    } catch (error) {

        console.error(
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================================
// CLIC EN BOTONES
// =====================================================

if (offersGrid) {

    offersGrid.addEventListener(
        "click",
        async event => {


            const button =
                event.target.closest(
                    ".offer-control-btn"
                );


            if (!button) {

                return;

            }


            const productId =
                button.dataset.id;


            const action =
                button.dataset.action;


            /*
                Desactivar temporalmente
                para evitar doble clic.
            */

            button.disabled =
                true;


            try {


                if (
                    action ===
                    "offer"
                ) {

                    await toggleOffer(
                        productId
                    );

                }


                if (
                    action ===
                    "featured"
                ) {

                    await toggleFeatured(
                        productId
                    );

                }


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    error.message ||
                    "Ocurrió un error."
                );


            } finally {

                /*
                    Después de actualizar,
                    la tarjeta se vuelve a
                    generar.
                */

                button.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// BUSCADOR
// =====================================================

if (offersSearch) {

    offersSearch.addEventListener(
        "input",
        filterProducts
    );

}


// =====================================================
// FILTRO OFERTAS
// =====================================================

if (offerFilter) {

    offerFilter.addEventListener(
        "change",
        filterProducts
    );

}


// =====================================================
// FILTRO ESTADO
// =====================================================

if (statusFilter) {

    statusFilter.addEventListener(
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

            if (offersSearch) {

                offersSearch.value =
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