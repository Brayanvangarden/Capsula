import { jsPDF } from "jspdf";

function moneda(value) {
  return `CRC ${Number(value ?? 0).toLocaleString("en-US")}`;
}

function crearPdf(factura) {
  const pdf = new jsPDF();
  let y = 18;
  const salto = 7;
  pdf.setFontSize(16);
  pdf.text(factura.empresa_nombre_comercial, 15, y);
  y += salto;
  pdf.setFontSize(10);
  pdf.text(
    `${factura.empresa_identificacion} | ${factura.empresa_direccion}`,
    15,
    y,
  );
  y += salto;
  pdf.text(`${factura.empresa_telefono} | ${factura.empresa_correo}`, 15, y);
  y += 12;
  pdf.setFontSize(14);
  pdf.text(`FACTURA ${factura.numero_factura}`, 15, y);
  y += salto;
  pdf.setFontSize(10);
  pdf.text(
    `Emitida: ${new Date(factura.fecha_emision).toLocaleString("es-CR")}`,
    15,
    y,
  );
  y += 10;
  pdf.text(`Cliente: ${factura.cliente_nombre}`, 15, y);
  y += salto;
  pdf.text(`Orden: #${factura.orden_id} | Pago: ${factura.metodo_pago}`, 15, y);
  y += 10;
  pdf.setFont(undefined, "bold");
  pdf.text(
    "Codigo       Descripcion                 Cant.   Precio       Subtotal",
    15,
    y,
  );
  pdf.setFont(undefined, "normal");
  y += salto;
  factura.detalle.forEach((item) => {
    if (y > 270) {
      pdf.addPage();
      y = 18;
    }
    const descripcion = String(item.descripcion).slice(0, 27);
    pdf.text(
      `${String(item.codigo_producto || "-")
        .slice(0, 10)
        .padEnd(
          11,
        )} ${descripcion.padEnd(28)} ${String(item.cantidad).padStart(5)} ${moneda(item.precio_unitario).padStart(11)} ${moneda(item.subtotal).padStart(12)}`,
      15,
      y,
    );
    y += salto;
  });
  y += 5;
  pdf.text(`Subtotal: ${moneda(factura.subtotal)}`, 145, y);
  y += salto;
  pdf.text(`Descuentos: ${moneda(factura.descuentos)}`, 145, y);
  y += salto;
  pdf.text(`Impuestos: ${moneda(factura.impuestos)}`, 145, y);
  y += salto;
  pdf.setFont(undefined, "bold");
  pdf.text(`TOTAL: ${moneda(factura.total)}`, 145, y);
  y += salto;
  pdf.setFont(undefined, "normal");
  pdf.text(
    `Pagado: ${moneda(factura.monto_pagado)} | Saldo: ${moneda(factura.saldo)}`,
    15,
    y,
  );
  y += 14;
  pdf.text("Gracias por su compra.", 15, y);
  return pdf;
}

export function generarFacturaPdf(factura) {
  crearPdf(factura).save(`${factura.numero_factura}.pdf`);
}

export function imprimirFactura(factura) {
  const pdf = crearPdf(factura);
  const blobUrl = pdf.output("bloburl");
  const ventana = window.open(blobUrl, "_blank");
  ventana?.addEventListener("load", () => ventana.print());
}
