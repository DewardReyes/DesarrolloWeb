# SmartPhone RD --- Plataforma de venta y gestión de inventario

SmartPhone RD es una aplicación web para consultar y vender celulares y
productos tecnológicos. Incluye un catálogo de productos, carrito de
compras y proceso de compra para los clientes, además de un panel
administrativo para gestionar productos, inventario, ofertas, clientes y
pedidos.

## Funcionalidades principales

### Para clientes

-   Consultar el catálogo de productos.
-   Buscar y filtrar productos según las opciones disponibles en la
    interfaz.
-   Agregar productos al carrito y ajustar cantidades.
-   Completar el proceso de compra con los datos de entrega y el método
    de pago disponible.

### Para administración

-   Consultar indicadores del negocio desde el panel administrativo.
-   Crear y editar productos y gestionar su inventario.
-   Administrar ofertas y productos destacados.
-   Consultar pedidos y actualizar su estado.
-   Consultar información de clientes e historial de pedidos.
-   Consultar movimientos de inventario, cuando estén registrados.

## Tecnologías

**Frontend** - HTML5 - CSS3 - JavaScript (ES6+) - Fetch API para
comunicarse con el backend

**Backend** - Node.js - Express - MySQL - `mysql2` para la conexión a
MySQL - `dotenv` para cargar variables de entorno - `bcryptjs` para el
hash de contraseñas - `jsonwebtoken` para trabajar con tokens JWT -
`multer` para la gestión de archivos

**Herramientas** - Git y GitHub - MySQL Workbench (opcional, para
administrar la base de datos mediante interfaz gráfica)

## Requisitos previos

Antes de ejecutar el proyecto, instala:

-   Node.js y npm.
-   MySQL Server o acceso a una instancia MySQL compatible.
-   Git, si vas a clonar el repositorio.
-   Un navegador web moderno.

## Obtener el proyecto

Clona el repositorio y entra en la carpeta:

``` bash
git clone https://github.com/DewardReyes/DesarrolloWeb.git
cd DesarrolloWeb
```

## Configurar el backend

Entra en la carpeta del backend e instala sus dependencias:

``` bash
cd backend
npm install
```

Crea el archivo `backend/.env` tomando como referencia
`backend/.env.example`. Configura los valores de acuerdo con tu
instalación de MySQL:

``` dotenv
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=smartphone_rd
DB_PORT=3306
DB_SSL_CA=
JWT_SECRET=reemplaza_esto_por_un_secreto_largo_y_aleatorio
```

Los valores anteriores son ejemplos para una instalación local. Si
utilizas una base de datos en la nube, sustituye `DB_HOST`, `DB_USER`,
`DB_PASSWORD`, `DB_PORT` y, cuando corresponda, `DB_SSL_CA` por los
datos proporcionados por tu proveedor. No publiques el archivo `.env` ni
incluyas contraseñas o secretos reales en este README.

## Crear la base de datos

El script SQL del proyecto está ubicado en:

``` text
backend/db/db
```

Abre ese archivo desde MySQL Workbench o tu cliente MySQL y ejecuta su
contenido con un usuario que tenga permisos para crear la base de datos
y sus tablas. El script crea la base de datos `smartphone_rd`, las
tablas del sistema y categorías iniciales.

El script incluye las tablas y categorías iniciales, pero no inserta por
sí solo un usuario administrador ni un catálogo completo de productos.
Para la demostración, prepara los datos de prueba que necesites.

> Si la base de datos ya existe y contiene información, revisa el script
> antes de ejecutarlo de nuevo: incluye instrucciones para crear la base
> de datos y las tablas.

## Crear un administrador de demostración

El proyecto incluye el archivo `backend/create-admin.js`. Antes de
ejecutarlo, revisa ese archivo y configura las credenciales de
demostración de forma segura. No publiques credenciales reales ni las
dejes escritas directamente en el código.

Con la base de datos configurada, ejecuta desde la carpeta `backend`:

``` bash
node create-admin.js
```

El script intenta crear un usuario con rol `admin`. Si el correo ya
existe, indica que no crea otro administrador. Asegúrate de que las
credenciales configuradas coincidan con las que usarás durante la
demostración.

## Iniciar el servidor

Desde la carpeta `backend`, ejecuta:

``` bash
npm start
```

El servidor utiliza el puerto indicado en `PORT`; si no se configura,
utiliza el puerto `3000`.

La ruta principal de la API está disponible en:

``` text
http://localhost:3000/
```

La respuesta esperada informa que la API de SmartPhone RD está
funcionando. Las rutas principales de la API son:

-   `/api/auth`
-   `/api/products`
-   `/api/orders`

Para detener el servidor, pulsa `Ctrl + C` en la terminal.

## Abrir el frontend

Los archivos de la interfaz están dentro de la carpeta `frontend`.
Puedes abrirlos con un servidor estático de desarrollo, por ejemplo la
extensión **Live Server** de Visual Studio Code, y mantener el backend
ejecutándose en otra terminal.

Si la interfaz no logra comunicarse con la API, comprueba que la
dirección del backend configurada en los archivos JavaScript coincida
con el entorno donde estás ejecutando el servidor. En desarrollo local,
normalmente será `http://localhost:3000`.

## Solución de problemas

-   **Error de conexión a MySQL:** comprueba que el servidor de base de
    datos esté activo y que `DB_HOST`, `DB_USER`, `DB_PASSWORD`,
    `DB_NAME` y `DB_PORT` sean correctos.
-   **Faltan módulos de Node.js:** entra en `backend` y ejecuta
    `npm install`.
-   **El puerto está ocupado:** cambia `PORT` por un puerto disponible y
    utiliza esa misma dirección al probar la API.
-   **No puedes iniciar sesión como administrador:** verifica que el
    administrador se haya creado en la base de datos y que estés
    utilizando las credenciales configuradas para la demostración.
-   **No aparecen productos:** comprueba que existan registros en la
    tabla `products`; el script SQL incluye categorías iniciales, pero
    no un catálogo completo de productos.

## Seguridad

-   No subas `.env` a GitHub.
-   Mantén `.env.example` con valores de ejemplo, nunca con contraseñas
    o secretos reales.
-   Usa una clave `JWT_SECRET` larga, aleatoria y privada.
-   Cambia las credenciales de demostración antes de compartir o
    desplegar el proyecto.
-   No uses credenciales de desarrollo en un entorno de producción.

## Equipo de desarrollo

Proyecto desarrollado de manera colaborativa por estudiantes de la
Universidad Abierta Para Adultos (UAPA):

-   Isaías Alejandro Figuereo Hernández --- 100075152
-   Saúl Gómez Mercado --- 100091229
-   Darlin Alexander Marte Coronado --- 100076430
-   Mitiel Alberto Morrobel Díaz --- 100039936
-   Lizardo José Paniagua Torres --- 100078548
-   Jeremy Polanco Peralta --- 100096209
-   Yanibel Pérez Vásquez --- 100076965
-   Deward Francisco Reyes Sosa --- 100075688
-   Ángel Gabriel Torres Holguín --- 100076837

## Alcance de esta guía

Este README describe la estructura y los comandos identificados en el
repositorio. La disponibilidad de una cuenta de demostración, los datos
de productos y el funcionamiento completo del frontend deben verificarse
en el entorno donde se vaya a evaluar el proyecto.
