# SmartPhone RD - Plataforma de Venta y Gestión de Inventario

SmartPhone RD es una aplicación web integral orientada a la presentación y venta de celulares y productos tecnológicos. El proyecto fue desarrollado como trabajo final universitario estructurado en tres fases evolutivas: diseño de maquetación estática, interactividad del lado del cliente y construcción de una arquitectura cliente-servidor con base de datos en la nube. El sistema permite a los clientes explorar productos y realizar compras, mientras que proporciona a los administradores un panel de control completo para gestionar el inventario, los pedidos y las ofertas.

## Características Principales

*   **Experiencia del Cliente (Frontend):**
    *   **Catálogo Interactivo:** Visualización de productos con filtros dinámicos por texto y estado de stock.
    *   **Carrito de Compras:** Sistema de carrito persistente mediante `localStorage` que permite agregar productos, ajustar cantidades y visualizar subtotales en tiempo real.
    *   **Checkout:** Formulario de finalización de compra con captura de datos del cliente, dirección de entrega y selección de método de pago (contra entrega o transferencia).
*   **Panel Administrativo (Backend):**
    *   **Dashboard Estadístico:** Tarjetas de resumen con datos en tiempo real sobre total de productos, alertas de stock bajo, pedidos pendientes e ingresos totales.
    *   **Gestión de Pedidos:** Seguimiento completo del estado del pedido (Pendiente, Confirmado, Entregado, Cancelado) con actualización en tiempo real en la base de datos.
    *   **Control de Inventario (CRUD):** Capacidad para agregar nuevos productos, editar detalles técnicos (RAM, almacenamiento, color, marca), gestionar el stock y ver el historial de movimientos de inventario por entradas y salidas.
    *   **Gestión de Ofertas y Destacados:** Módulo para activar precios de oferta (mostrando el precio anterior tachado) y fijar productos en la sección de destacados.
    *   **Historial de Clientes:** Vista detallada de los clientes registrados, historial de pedidos individuales y el valor total de sus compras.

## Tecnologías y Herramientas Utilizadas

**Frontend:**
*   **HTML5 & CSS3:** Maquetación semántica, CSS Grid, Flexbox y diseño adaptable (Media Queries).
*   **JavaScript (ES6+):** Manipulación del DOM, validación de formularios, formato de precios y comunicación asíncrona (Fetch API) con el servidor.

**Backend:**
*   **Node.js & Express.js:** Servidor local, enrutamiento (`/api/auth`, `/api/products`, `/api/orders`) y creación de API REST.
*   **MySQL:** Sistema gestor de base de datos relacional para el almacenamiento de usuarios, inventario e historial de pedidos.
*   **Aiven:** Servicio de alojamiento en la nube utilizado para el despliegue de la base de datos MySQL.

**Seguridad y Control:**
*   **JSON Web Tokens (JWT):** Autenticación de usuarios y protección de rutas administrativas mediante tokens con 8 horas de duración.
*   **Bcryptjs:** Encriptación y hashing de contraseñas en la base de datos para garantizar la seguridad de los accesos.
*   **Git & GitHub:** Control de versiones, gestión de ramas (`fase-1-maquetacion`, `fase-3-backend`) y trabajo colaborativo.

## Requisitos Previos

Para ejecutar este proyecto en un entorno local, asegúrese de tener instalado:
*   Node.js (Entorno de ejecución).
*   Gestor de paquetes `npm` (incluido con Node.js).
*   MySQL Server o MySQL Workbench (Solo si desea ejecutar la base de datos localmente en lugar de usar la conexión de Aiven).

## Instalación y Ejecución Local

**1. Clonar el repositorio:**
```bash
git clone [https://github.com/DewardReyes/DesarrolloWeb.git](https://github.com/DewardReyes/DesarrolloWeb.git)
cd DesarrolloWeb
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Configurar variables de entorno:**
Cree un archivo `.env` en la raíz del proyecto basándose en las credenciales de su base de datos. El proyecto utiliza la siguiente estructura:
```env
PORT=3000
DB_HOST=servidor_de_MySQL_o_Aiven
DB_USER=avnadmin
DB_NAME=smartphone_rd
DB_PORT=10792
JWT_SECRET=smartphone_rd_secret_20225
```

**4. Configurar la Base de Datos:**
Si no está utilizando la conexión directa a la nube (Aiven), importe la estructura de la base de datos utilizando el archivo provisto en el código fuente:
*   Abra su gestor de base de datos (ej. MySQL Workbench).
*   Ejecute el script SQL alojado en el archivo `db.sql` (ubicado dentro de la carpeta del backend) para crear las tablas relacionales y sus dependencias.

**5. Iniciar el servidor:**
Ejecute el siguiente comando en su terminal para levantar el servidor backend:
```bash
node server.js
```

**6. Acceder a la aplicación:**
Abra su navegador web y visite: `http://localhost:3000`

## Credenciales de Demostración (Administrador)

Para evaluar todas las funcionalidades del panel de control (`Dashboard`), utilice las siguientes credenciales de acceso:
*   **Correo Electrónico:** Dewnicole2929@gmail.com
*   **Contraseña:** [COLOQUE_SU_CONTRASEÑA_AQUÍ]

## Equipo de Desarrollo

Este proyecto fue desarrollado de manera colaborativa por estudiantes de la Universidad Abierta Para Adultos (UAPA):

*   **Isaías Alejandro Figuereo Hernández** - 100075152
*   **Saúl Gómez Mercado** - 100091229
*   **Darlin Alexander Marte Coronado** - 100076430
*   **Mitiel Alberto Morrobel Díaz** - 100039936
*   **Lizardo José Paniagua Torres** - 100078548
*   **Jeremy Polanco Peralta** - 100096209
*   **Yanibel Pérez Vásquez** - 100076965
*   **Deward Francisco Reyes Sosa** - 100075688
*   **Ángel Gabriel Torres Holguín** - 100076837
