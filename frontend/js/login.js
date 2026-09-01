const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginBtn =
    document.getElementById("loginBtn");


// ==========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================

togglePassword.addEventListener(
    "click",
    () => {

        const icon =
            togglePassword.querySelector("i");


        if (
            passwordInput.type === "password"
        ) {

            passwordInput.type = "text";

            icon.classList.remove(
                "fa-eye"
            );

            icon.classList.add(
                "fa-eye-slash"
            );

        } else {

            passwordInput.type = "password";

            icon.classList.remove(
                "fa-eye-slash"
            );

            icon.classList.add(
                "fa-eye"
            );

        }

    }
);


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showMessage(
                "Completa todos los campos.",
                "error"
            );

            return;

        }


        loginBtn.disabled = true;

        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Iniciando sesión...
        `;


        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "No se pudo iniciar sesión."
                );

            }


            // Guardar token

            localStorage.setItem(
                "smartphoneToken",
                data.token
            );


            // Guardar usuario

            localStorage.setItem(
                "smartphoneUser",
                JSON.stringify(
                    data.user
                )
            );


            showMessage(
                "Inicio de sesión exitoso. Redirigiendo...",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "../admin/dashboard.html";

            }, 800);


        } catch (error) {

            console.error(error);


            showMessage(
                error.message ||
                "Error conectando con el servidor.",
                "error"
            );


            loginBtn.disabled = false;

            loginBtn.innerHTML = `
                <span>
                    Iniciar sesión
                </span>

                <i class="fa-solid fa-arrow-right"></i>
            `;

        }

    }
);


// ==========================================
// MENSAJE
// ==========================================

function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;

    loginMessage.className =
        `login-message ${type}`;

}