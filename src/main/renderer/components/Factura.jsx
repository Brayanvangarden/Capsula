import {
  generarFacturaPdf,
  imprimirFactura,
} from "../services/facturaPdf.service";

function moneda(value) {
  return `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumeroOrden(id) {
  return `No. ${String(Number(id ?? 0)).padStart(4, "0")}`;
}

export default function Factura({ factura, onClose }) {
  if (!factura) return null;

  const subtotal = Number(factura.subtotal ?? 0);
  const descuentos = Number(factura.descuentos ?? 0);
  const impuestos = Number(factura.impuestos ?? 0);
  const total = Number(factura.total ?? subtotal - descuentos + impuestos);
  const saldo = Number(factura.saldo ?? 0);

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
            Print
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => generarFacturaPdf(factura)}
          >
            Download PDF
          </button>
          <button
            type="button"
            className="btn-secondary factura-cerrar"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <article className="factura-documento factura-documento-proforma">
          <header className="factura-header-proforma">
            <div className="factura-brand-block">
              <div className="factura-brand-logo">LOGICAPS</div>
              <p>NATUR VITALIA LLC</p>
              <p>7980 W 25th Ct. Hialeah, FL 33016</p>
              <p>Tel. (754) 209-3195 / (954) 889-4019</p>
            </div>
            <div className="factura-invoice-meta">
              <strong>INVOICE</strong>
              <span>{formatNumeroOrden(factura.orden_id)}</span>
            </div>
          </header>

          <div className="factura-box-grid">
            <div className="factura-box">
              <h2>Bill to:</h2>
              <p>{factura.cliente_nombre || "Customer Company"}</p>
              <p>{factura.cliente_identificacion || "Company name"}</p>
              <p>{factura.cliente_direccion || "Address not provided"}</p>
              <p>{factura.cliente_telefono || "Phone not provided"}</p>
              <p>{factura.cliente_correo || "Email not provided"}</p>
            </div>
            <div className="factura-box">
              <h2>Ship to:</h2>
              <p>{factura.notas || "No shipping notes"}</p>
            </div>
          </div>

          <table className="factura-tabla factura-tabla-proforma">
            <thead>
              <tr>
                <th>Item No.</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {factura.detalle.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo_producto || item.producto_id || "—"}</td>
                  <td>
                    {item.descripcion || item.producto_nombre || "Product"}
                  </td>
                  <td>{item.cantidad}</td>
                  <td>{moneda(item.precio_unitario ?? item.precio ?? 0)}</td>
                  <td>{moneda(item.subtotal ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="factura-totales factura-totales-proforma">
            <div className="factura-totales-row">
              <span>Subtotal</span>
              <strong>{moneda(subtotal)}</strong>
            </div>
            <div className="factura-totales-row">
              <span>Shipping</span>
              <strong>{moneda(0)}</strong>
            </div>
            <div className="factura-totales-row">
              <span>Tax</span>
              <strong>{moneda(impuestos || 0)}</strong>
            </div>
            <div className="factura-totales-row">
              <span>Deposit</span>
              <strong>{moneda(0)}</strong>
            </div>
            <div className="factura-totales-row factura-total-row">
              <span>Total</span>
              <strong>{moneda(total)}</strong>
            </div>
          </div>

          <div className="factura-payment-block">
            <p>Payment method</p>
            <p>Checks may be sent ACH to:</p>
            <p>NATUR VITALIA LLC</p>
            <p>Wells Fargo Bank</p>
            <p>Account #2813330806</p>
            <p>For direct deposit routing #063107513</p>
            <p>For wire transfer routing #121000248</p>
          </div>

          <div className="factura-note-block">
            <p>NOTE: All orders must be paid as follows:</p>
            <p>
              1) Any payments to Natur Vitalia LLC greater or equal to $5,000
              will need to be made in
            </p>
            <p>
              the form of a wire or credit card (CC 3% processing fee will be
              charged for any amount)
            </p>
            <p>to facilitate a commencement of the order.</p>
            <p>
              2) Any payments via check (regardless of size) may delay
              commencement of the order
            </p>
            <p>
              and/or delivery by up to 10 days from the date Natur Vitalia LLC
              receives the check.
            </p>
            <p>
              3) Payments must be done within 30 days after the order has been
              delivered.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
