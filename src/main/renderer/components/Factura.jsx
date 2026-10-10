import {
  COMPANY_LOGO_URL,
  generarFacturaPdf,
  imprimirFactura,
} from "../services/facturaPdf.service";
import { useState } from "react";

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
  const [error, setError] = useState("");
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
            onClick={async () => {
              setError("");
              try {
                await imprimirFactura(factura);
              } catch (actionError) {
                setError(actionError.message || "No se pudo imprimir la factura.");
              }
            }}
          >
            Print
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              setError("");
              try {
                await generarFacturaPdf(factura);
              } catch (actionError) {
                setError(actionError.message || "No se pudo generar el PDF.");
              }
            }}
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

        {error && <p className="message-error">{error}</p>}

        <article className="factura-documento factura-documento-proforma">
          <header className="factura-header-proforma">
            <div className="factura-brand-block">
              <img
                className="factura-brand-logo"
                src={COMPANY_LOGO_URL}
                alt="Logo de Logicaps"
              />
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
              <p>{factura.cliente_direccion || "Address not provided"}</p>
            </div>
            <div className="factura-box">
              <h2>Ship to:</h2>
              <p>
                {factura.ship_to_direccion ||
                  factura.notas ||
                  "Address not provided"}
              </p>
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
            <p>$35 Applies to all the checks returned for any reason</p>
          </div>

          <div className="factura-note-block">
            <p>
              <strong>*NOTE:</strong> All orders must be paid as follows:
            </p>
            <p>
              1) Any payments to Natur Vitalia LLC greater or equal to $5,000
              will need to be made in the form of a wire or credit card (CC 3%
              processing fee will be charged for any amount) to facilitate a
              commencement of the order.
            </p>
            <p>
              2) Any payments via check (regardless of size) may delay
              commencement of the order and/or delivery by up to 10 days from
              the date Natur Vitalia LLC receives the check.
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
