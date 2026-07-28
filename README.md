# Capsulas Inventario

Aplicación de escritorio desarrollada con Electron, React y SQLite para gestionar el inventario de cápsulas, así como el control de clientes, ventas, pedidos y pagos.

## Descripción general

Capsulas Inventario es una solución pensada para negocios que necesitan llevar un control detallado de:

- Inventario de cápsulas vacías y productos relacionados
- Categorías y stock mínimo
- Clientes y saldos pendientes
- Órdenes de venta y seguimiento de estado
- Pagos recibidos y control financiero básico
- Reportes y alertas de stock bajo o productos próximos a vencer

## Características principales

- Gestión de usuarios y roles
- Administración de productos y categorías
- Control de stock, lotes y fechas de vencimiento
- Registro de clientes y balances pendientes
- Creación y seguimiento de órdenes de venta
- Registro de pagos y estados de pago
- Historial de movimientos e incidencias
- Interfaz de escritorio moderna con React

## Tecnologías utilizadas

- Electron
- React
- Vite
- React Router DOM
- Zustand
- React Hook Form
- Zod
- better-sqlite3
- jsPDF
- dayjs

## Requisitos del sistema

Para ejecutar el proyecto correctamente, necesitas:

- Node.js 20.x o superior
- pnpm 11.1.2 o superior
- Git
- Python 3.11+ (recomendado para compilar dependencias nativas)
- Visual Studio 2022 o Visual Studio Build Tools 2022 con el componente de C++ para Windows

> Importante: en Windows, la compilación de algunas dependencias nativas puede fallar si la ruta del proyecto contiene espacios. Se recomienda usar una ruta como `C:\Projects\Capsulas`.

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd Capsulas
```

2. Instala las dependencias del proyecto:

```bash
pnpm install
```

3. Si aparece algún error con módulos nativos como `better-sqlite3`, ejecuta:

```bash
pnpm run rebuild
```

### Uso del archivo de requisitos

Este proyecto incluye un archivo llamado `requirements.txt` con la lista de paquetes principales usados por la aplicación. Para usarlo como referencia de instalación, puedes ejecutar:

```bash
pnpm install
```

Si deseas instalar todo lo necesario desde cero en Windows, también puedes seguir este orden:

```bash
pnpm install
pnpm run rebuild
```

> En Windows es importante tener instalado Visual Studio Build Tools con soporte para C++ y Python 3.11+ para evitar problemas con dependencias nativas.

## Ejecución en desarrollo

Para levantar la aplicación en modo desarrollo:

```bash
pnpm dev
```

Esto iniciará la interfaz de Vite y la aplicación Electron de forma simultánea.

## Compilación para producción

Para generar el instalador o paquete de la aplicación:

```bash
pnpm build
```

Los archivos compilados se generarán en la carpeta `release`.

## Datos de prueba

El proyecto incluye semillas de base de datos con usuarios, clientes, productos, órdenes y pagos para probar la aplicación rápidamente.

Usuario por defecto de ejemplo:

- Usuario: `admin`
- Contraseña: `1234`

## Estructura del proyecto

- `src/main` — lógica principal de Electron, base de datos y procesos del sistema
- `src/renderer` — interfaz de usuario en React
- `src/main/database` — esquema, migraciones y datos iniciales

## Notas de desarrollo

Si encuentras problemas con `better-sqlite3` en Windows, asegúrate de tener instalados correctamente Visual Studio Build Tools y que la terminal pueda acceder a las herramientas de compilación de C++.

## Licencia

Este proyecto está bajo la licencia ISC.

