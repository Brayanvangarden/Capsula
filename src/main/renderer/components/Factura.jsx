import {
  generarFacturaPdf,
  imprimirFactura,
} from "../services/facturaPdf.service";

function moneda(value) {
  return `₡${Number(value ?? 0).toLocaleString("es-CR")}`;
}

function fechaHora(value) {
  return value ? new Date(value).toLocaleString("es-CR") : "—";
}

export default function Factura({ factura, onClose }) {
  if (!factura) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="factura-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="factura-actions">
          <button
            type="button"
            className="btn-secondary factura-imprimir"
            onClick={() => imprimirFactura(factura)}
          >
            Imprimir
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => generarFacturaPdf(factura)}
          >
            Descargar PDF
          </button>
          <button
            type="button"
            className="btn-secondary factura-cerrar"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <article className="factura-documento">
          <header className="factura-encabezado">
            <div>
              <h1>{factura.empresa_nombre_comercial}</h1>
              <p>{factura.empresa_nombre}</p>
              <p>{factura.empresa_identificacion}</p>
              <p>{factura.empresa_direccion}</p>
              <p>
                {factura.empresa_telefono} · {factura.empresa_correo}
              </p>
            </div>
            <div className="factura-meta">
              <strong>FACTURA</strong>
              <span>{factura.numero_factura}</span>
              <span>Emitida: {fechaHora(factura.fecha_emision)}</span>
              <span className="pill pill-si">{factura.estado}</span>
            </div>
          </header>

          <div className="factura-datos-grid">
            <div>
              <h2>Cliente</h2>
              <p>{factura.cliente_nombre}</p>
              <p>
                {factura.cliente_identificacion ||
                  "Identificacion no registrada"}
              </p>
              <p>{factura.cliente_correo || "Correo no registrado"}</p>
              <p>{factura.cliente_telefono || "Telefono no registrado"}</p>
              <p>{factura.cliente_direccion || "Direccion no registrada"}</p>
            </div>
            <div>
              <h2>Compra</h2>
              <p>Orden: #{factura.orden_id}</p>
              <p>Fecha: {fechaHora(factura.orden_fecha)}</p>
              <p>Metodo de pago: {factura.metodo_pago}</p>
              <p>Estado del pago: {factura.estado_pago}</p>
            </div>
          </div>

          <table className="factura-tabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Descripcion</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Descuento</th>
                <th>Impuesto</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {factura.detalle.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo_producto || "—"}</td>
                  <td>{item.descripcion}</td>
                  <td>{item.cantidad}</td>
                  <td>{moneda(item.precio_unitario)}</td>
                  <td>{moneda(item.descuento)}</td>
                  <td>{moneda(item.impuesto)}</td>
                  <td>{moneda(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="factura-totales">
            <p>
              <span>Subtotal</span>
              <strong>{moneda(factura.subtotal)}</strong>
            </p>
            <p>
              <span>Descuentos</span>
              <strong>{moneda(factura.descuentos)}</strong>
            </p>
            <p>
              <span>Impuestos</span>
              <strong>{moneda(factura.impuestos)}</strong>
            </p>
            <p className="factura-total">
              <span>Total</span>
              <strong>{moneda(factura.total)}</strong>
            </p>
            <p>
              <span>Monto pagado</span>
              <strong>{moneda(factura.monto_pagado)}</strong>
            </p>
            <p>
              <span>Saldo</span>
              <strong>{moneda(factura.saldo)}</strong>
            </p>
          </div>

          <footer className="factura-pie">
            <strong>Gracias por su compra.</strong>
            <p>
              {factura.notas ||
                "Conserve esta factura como comprobante de su compra."}
            </p>
            <p>
              {factura.empresa_telefono} · {factura.empresa_correo}
            </p>
          </footer>
        </article>
      </section>
    </div>
  );
}
