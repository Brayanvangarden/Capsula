# Capsulas Inventario

## Requisitos de desarrollo en Windows

`better-sqlite3` requiere compilar un módulo nativo cuando no existe un binario preconstruido compatible con tu versión de Electron/Node.

### Dependencias necesarias

Instala al menos una de las siguientes herramientas:

- Visual Studio 2022 con el componente "Desarrollo de escritorio con C++"
- Visual Studio Build Tools 2022 (con C++ build tools)

También puede ser necesario:

- Python 3.11+ (si no está incluido en la instalación de Visual Studio)

> Nota: `node-gyp` puede fallar si la ruta del proyecto contiene espacios. Si tienes problemas persistentes, mueve el proyecto a una ruta sin espacios, por ejemplo `C:\Projects\Capsulas`.

### Comandos útiles

```bash
pnpm install
pnpm run rebuild
pnpm dev
```

Si `pnpm run rebuild` falla, asegúrate de que Visual Studio o Build Tools estén instalados y disponibles en la terminal.
