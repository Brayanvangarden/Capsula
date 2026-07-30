const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {

  // ══════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════
  auth: {
    login:   (credentials)  => ipcRenderer.invoke('auth:login', credentials),
    getById: (id)            => ipcRenderer.invoke('auth:getById', id),
  },

  // ══════════════════════════════════════
  //  CATEGORÍAS
  // ══════════════════════════════════════
  categorias: {
    getAll:    ()           => ipcRenderer.invoke('categorias:getAll'),
    getActivas:()           => ipcRenderer.invoke('categorias:getActivas'),
    getById:   (id)         => ipcRenderer.invoke('categorias:getById', id),
    create:    (data)       => ipcRenderer.invoke('categorias:create', data),
    update:    (data)       => ipcRenderer.invoke('categorias:update', data),
    delete:    (id)         => ipcRenderer.invoke('categorias:delete', id),
  },

  // ══════════════════════════════════════
  //  PRODUCTOS
  // ══════════════════════════════════════
  productos: {
    getAll:          ()         => ipcRenderer.invoke('productos:getAll'),
    getById:         (id)       => ipcRenderer.invoke('productos:getById', id),
    create:          (data)     => ipcRenderer.invoke('productos:create', data),
    update:          (data)     => ipcRenderer.invoke('productos:update', data),
    delete:          (id)       => ipcRenderer.invoke('productos:delete', id),
    stockBajo:       ()         => ipcRenderer.invoke('productos:stockBajo'),
    proximosVencer:  (dias)     => ipcRenderer.invoke('productos:proximosVencer', dias),
  },

  // ══════════════════════════════════════
  //  INVENTARIO
  // ══════════════════════════════════════
  inventario: {
    getMovimientos:    (filtros) => ipcRenderer.invoke('inventario:getMovimientos', filtros),
    getById:           (id)      => ipcRenderer.invoke('inventario:getById', id),
    entrada:           (data)    => ipcRenderer.invoke('inventario:entrada', data),
    salida:            (data)    => ipcRenderer.invoke('inventario:salida', data),
    resumenProducto:   (id)      => ipcRenderer.invoke('inventario:resumenProducto', id),
  },

  // ══════════════════════════════════════
  //  CLIENTES
  // ══════════════════════════════════════
  clientes: {
    getAll:               ()            => ipcRenderer.invoke('clientes:getAll'),
    getById:              (id)          => ipcRenderer.invoke('clientes:getById', id),
    create:               (data)        => ipcRenderer.invoke('clientes:create', data),
    update:               (data)        => ipcRenderer.invoke('clientes:update', data),
    delete:               (id)          => ipcRenderer.invoke('clientes:delete', id),
    updateBalance:        (id, monto)   => ipcRenderer.invoke('clientes:updateBalance', { id, monto }),
    getPrecioEspecial:    (cliente_id, producto_id) => ipcRenderer.invoke('clientes:getPrecioEspecial', { cliente_id, producto_id }),
    getPreciosEspeciales: ()            => ipcRenderer.invoke('clientes:precios:getAll'),
    getPreciosEspecialesByCliente: (cliente_id) => ipcRenderer.invoke('clientes:precios:getByClienteId', cliente_id),
    createPrecioEspecial: (data)        => ipcRenderer.invoke('clientes:precios:create', data),
    updatePrecioEspecial: (data)        => ipcRenderer.invoke('clientes:precios:update', data),
    deletePrecioEspecial: (id)          => ipcRenderer.invoke('clientes:precios:delete', id),
    importBulk: (filas) => ipcRenderer.invoke('clientes:importBulk', filas),
  },

  // ══════════════════════════════════════
  //  ÓRDENES
  // ══════════════════════════════════════
  ordenes: {
    getAll:           (filtros)      => ipcRenderer.invoke('ordenes:getAll', filtros),
    getById:          (id)           => ipcRenderer.invoke('ordenes:getById', id),
    create:           (data)         => ipcRenderer.invoke('ordenes:create', data),
    updateEstado:     (id, estado)   => ipcRenderer.invoke('ordenes:updateEstado', { id, estado }),
    updateEstadoPago: (id, estadoPago) => ipcRenderer.invoke('ordenes:updateEstadoPago', { id, estado_pago: estadoPago }),
    resumen:          ()             => ipcRenderer.invoke('ordenes:resumen'),
  },

  // ══════════════════════════════════════
  //  PAGOS
  // ══════════════════════════════════════
  pagos: {
    getAll:           (filtros)   => ipcRenderer.invoke('pagos:getAll', filtros),
    getById:          (id)        => ipcRenderer.invoke('pagos:getById', id),
    create:           (data)      => ipcRenderer.invoke('pagos:create', data),
    historialCliente: (clienteId) => ipcRenderer.invoke('pagos:historialCliente', clienteId),
    resumen:          ()          => ipcRenderer.invoke('pagos:resumen'),
  },

  // ══════════════════════════════════════
  //  USUARIOS
  // ══════════════════════════════════════
  usuarios: {
    getAll:          ()        => ipcRenderer.invoke('usuarios:getAll'),
    getById:         (id)      => ipcRenderer.invoke('usuarios:getById', id),
    create:          (data)    => ipcRenderer.invoke('usuarios:create', data),
    update:          (data)    => ipcRenderer.invoke('usuarios:update', data),
    changePassword:  (data)    => ipcRenderer.invoke('usuarios:changePassword', data),
    toggleEstado:    (id)      => ipcRenderer.invoke('usuarios:toggleEstado', id),
  },

})
