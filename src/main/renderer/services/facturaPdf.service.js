import { jsPDF } from "jspdf";

export const COMPANY_LOGO_URL = new URL(
  "../../../../assets/logo factura.jpeg",
  import.meta.url,
).href;

let companyLogoPromise;

function getCompanyLogo() {
  if (!companyLogoPromise) {
    companyLogoPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("No se pudo preparar el logo de la empresa."));
          return;
        }
        context.drawImage(image, 0, 0);
        resolve({
          data: canvas.toDataURL("image/png"),
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };
      image.onerror = () =>
        reject(new Error("No se pudo cargar el logo de la empresa."));
      image.src = COMPANY_LOGO_URL;
    });
  }
  return companyLogoPromise;
}

function moneda(value) {
  return `$${Number(value ?? 0).toLocaleString("en-US")}`;
}

function formatOrdenNumero(id) {
  return `N.º ${String(Number(id ?? 0)).padStart(4, "0")}`;
}

function obtenerLineasShipTo(documento) {
  const direccion = documento?.ship_to_direccion || documento?.notas;
  return String(direccion || "Address not provided").split(/\r?\n/);
}

function monedaUsd(value) {
  return `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Dibuja el bloque de "Payment method" (izquierda) y la caja de totales
 * (derecha) con las líneas/bordes del formato solicitado:
 * - Línea horizontal completa arriba del bloque.
 * - Línea vertical separando etiquetas y montos en la caja de totales.
 * - Línea horizontal fina antes de "Total".
 * - Línea doble debajo de "Total".
 *
 * Devuelve el Y donde termina el bloque, para poder ubicar el
 * texto de notas debajo sin que se encime.
 */
function dibujarPieYPago(
  pdf,
  { margin, pageWidth, startY, subtotal, total, impuestosLabel = "Included" },
) {
  const totalsLabelX = pageWidth - 170;
  const totalsValueX = pageWidth - margin;
  const dividerX = totalsLabelX + 65;
  const rowHeight = 20;
  const lineTop = startY - 16;

  const rows = [
    { label: "Subtotal", value: monedaUsd(subtotal) },
    { label: "Shipping", value: monedaUsd(0) },
    { label: "Tax", value: impuestosLabel },
    { label: "Deposit", value: monedaUsd(0) },
  ];

  // Línea horizontal completa arriba de todo el bloque
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);
  pdf.line(margin, lineTop, pageWidth - margin, lineTop);

  pdf.setFontSize(10);
  rows.forEach((row, i) => {
    const rowY = startY + i * rowHeight;
    pdf.setFont("helvetica", "bold");
    pdf.text(row.label, totalsLabelX, rowY);
    pdf.setFont("helvetica", "normal");
    pdf.text(row.value, totalsValueX, rowY, { align: "right" });
  });

  const totalY = startY + rows.length * rowHeight;

  // Línea fina arriba de "Total"
  pdf.setLineWidth(0.8);
  pdf.line(totalsLabelX - 10, totalY - 15, pageWidth - margin, totalY - 15);

  pdf.setFont("helvetica", "bold");
  pdf.text("Total", totalsLabelX, totalY);
  pdf.text(monedaUsd(total), totalsValueX, totalY, { align: "right" });

  // Línea vertical separando etiqueta / monto
  pdf.setLineWidth(0.6);
  pdf.line(dividerX, lineTop, dividerX, totalY + 12);

  // Línea doble debajo de "Total"
  pdf.setLineWidth(1);
  pdf.line(totalsLabelX - 10, totalY + 9, pageWidth - margin, totalY + 9);
  pdf.line(totalsLabelX - 10, totalY + 12, pageWidth - margin, totalY + 12);

  // Bloque "Payment method" (columna izquierda)
  pdf.setFontSize(9.5);
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment method", margin, startY + 4);
  pdf.setFont("helvetica", "normal");
  pdf.text("Checks may be sent ACH to:", margin, startY + 20);
  pdf.setFont("helvetica", "bold");
  pdf.text("NATUR VITALIA LLC", margin, startY + 36);
  pdf.setFont("helvetica", "normal");
  pdf.text("Wells Fargo Bank", margin, startY + 52);
  pdf.text("Account #2813330806", margin, startY + 68);
  pdf.text("For direct deposit routing #063107513", margin, startY + 84);
  pdf.text("For wire transfer routing #121000248", margin, startY + 100);
  pdf.text(
    "$35 Applies to all the checks returned for any reason",
    margin,
    startY + 116,
  );

  const paymentBottom = startY + 116 + 14;
  return Math.max(totalY + 12, paymentBottom);
}

function dibujarNotas(pdf, { margin, pageWidth, pageHeight, startY }) {
  const noteParagraphs = [
    [
      "1) Any payments to Natur Vitalia LLC greater or equal to $5,000 will need to be made in",
      "the form of a wire or credit card (CC 3% processing fee will be charged for any amount)",
      "to facilitate a commencement of the order.",
    ],
    [
      "2) Any payments via check (regardless of size) may delay commencement of the order",
      "and/or delivery by up to 10 days from the date Natur Vitalia LLC receives the check.",
    ],
    [
      "3) Payments must be done within 30 days after the order has been delivered.",
    ],
  ];

  // Si no cabe en la página actual, agrega una nueva
  const alturaEstimada =
    14 + noteParagraphs.reduce((acc, p) => acc + p.length * 12 + 24, 0);
  let y = startY;
  if (y + alturaEstimada > pageHeight - 30) {
    pdf.addPage();
    y = 60;
  }

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("*NOTE:", margin, y);
  const noteLabelWidth = pdf.getTextWidth("*NOTE:");
  pdf.setFont("helvetica", "normal");
  pdf.text(" All orders must be paid as follows:", margin + noteLabelWidth, y);

  let noteCursor = y + 14;
  noteParagraphs.forEach((paragraph, paragraphIndex) => {
    paragraph.forEach((line) => {
      pdf.text(String(line), margin, noteCursor);
      noteCursor += 12;
    });
    if (paragraphIndex < noteParagraphs.length - 1) {
      noteCursor += 6;
    }
  });
}

async function dibujarEncabezado(
  pdf,
  { pageWidth, margin, titulo, numero, layout = "horizontal" },
) {
  const logo = await getCompanyLogo();
  const stacked = layout === "stacked";
  const maxLogoWidth = stacked ? 192 : 96;
  const maxLogoHeight = stacked ? 128 : 64;
  const logoScale = Math.min(
    maxLogoWidth / logo.width,
    maxLogoHeight / logo.height,
  );
  const logoWidth = logo.width * logoScale;
  const logoHeight = logo.height * logoScale;
  const logoX = margin;
  const logoY = stacked
    ? 24 + (maxLogoHeight - logoHeight) / 2
    : 32 + (64 - logoHeight) / 2;

  pdf.addImage(
    logo.data,
    "PNG",
    logoX,
    logoY,
    logoWidth,
    logoHeight,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const companyInfo = [
    "NATUR VITALIA LLC",
    "7980 W 25th Ct. Hialeah, FL 33016",
    "Tel. (754) 209-3195 / (954) 889-4019",
  ];
  if (stacked) {
    const companyX = margin;
    companyInfo.forEach((line, index) => {
      pdf.text(line, companyX, 24 + maxLogoHeight + 18 + index * 14);
    });
  } else {
    const companyX = margin + maxLogoWidth + 12;
    companyInfo.forEach((line, index) => {
      pdf.text(line, companyX, 48 + index * 14);
    });
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(titulo, pageWidth - 150, 52);
  pdf.setFontSize(11);
  pdf.text(numero, pageWidth - 150, 72);
}

async function crearPdf(factura) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 42;
  const boxWidth = pageWidth / 2 - 70;
  await dibujarEncabezado(pdf, {
    pageWidth,
    margin,
    titulo: "INVOICE",
    numero: `No. ${String(factura.orden_id ?? 0).padStart(4, "0")}`,
    layout: "stacked",
  });

  const billX = margin;
  const shipX = pageWidth / 2 + 12;
  const boxHeight = 108;
  let y = 230;

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.8);
  pdf.rect(billX, y, boxWidth, boxHeight);
  pdf.rect(shipX, y, boxWidth, boxHeight);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Bill to:", billX + 10, y + 18);
  pdf.text("Ship to:", shipX + 10, y + 18);

  pdf.setFont("helvetica", "normal");
  const billToLines = [
    factura.cliente_direccion || "Address not provided",
  ];

  const shipToLines = obtenerLineasShipTo(factura);
  const wrappedShip = shipToLines.flatMap((line) =>
    pdf.splitTextToSize(String(line || ""), boxWidth - 24),
  );

  let billY = y + 30;
  billToLines.forEach((line) => {
    pdf.text(String(line), billX + 18, billY);
    billY += 14;
  });

  let shipY = y + 30;
  wrappedShip.forEach((line) => {
    pdf.text(String(line), shipX + 18, shipY);
    shipY += 12;
  });

  y += boxHeight + 10;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Item No.", margin, y);
  pdf.text("Description", 120, y);
  pdf.text("Quantity", 350, y);
  pdf.text("Unit Price", 420, y);
  pdf.text("Total", 500, y);
  pdf.setDrawColor(180, 180, 180);
  pdf.line(margin, y + 4, pageWidth - margin, y + 4);

  pdf.setFont("helvetica", "normal");
  y += 18;
  const detalle = Array.isArray(factura.detalle) ? factura.detalle : [];
  const subtotal = detalle.reduce(
    (sum, item) => sum + Number(item.subtotal ?? 0),
    0,
  );
  const total = Number(factura.total ?? subtotal);
  const impuestos = Number(factura.impuestos ?? 0);

  detalle.forEach((item) => {
    if (y > pageHeight - 220) {
      pdf.addPage();
      y = 40;
    }

    const description = item.descripcion || item.producto_nombre || "Product";
    const itemNo = String(item.codigo_producto || item.producto_id || "-");
    const quantity = Number(item.cantidad ?? 0);
    const unitPrice = Number(item.precio_unitario ?? item.precio ?? 0);
    const lineTotal = Number(item.subtotal ?? quantity * unitPrice);

    pdf.text(itemNo, margin, y);
    const descriptionLines = pdf.splitTextToSize(description, 210);
    descriptionLines.forEach((line, lineIndex) => {
      pdf.text(String(line), 120, y + lineIndex * 10);
    });
    pdf.text(String(quantity), 356, y);
    pdf.text(monedaUsd(unitPrice), 420, y);
    pdf.text(monedaUsd(lineTotal), 500, y);
    y += 18;
  });

  const startY = Math.min(y + 48, pageHeight - 200);
  const bottomY = dibujarPieYPago(pdf, {
    margin,
    pageWidth,
    startY,
    subtotal,
    total,
  });

  dibujarNotas(pdf, { margin, pageWidth, pageHeight, startY: bottomY + 34 });

  return pdf;
}

async function crearProformaPdf(orden) {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 42;
  const boxWidth = pageWidth / 2 - 70;
  await dibujarEncabezado(pdf, {
    pageWidth,
    margin,
    titulo: "QUOTATION",
    numero: `No. ${String(orden?.id ?? 0).padStart(4, "0")}`,
    layout: "stacked",
  });

  const billX = margin;
  const shipX = pageWidth / 2 + 12;
  const boxHeight = 108;
  let y = 230;

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.8);
  pdf.rect(billX, y, boxWidth, boxHeight);
  pdf.rect(shipX, y, boxWidth, boxHeight);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Bill to:", billX + 10, y + 18);
  pdf.text("Ship to:", shipX + 10, y + 18);

  pdf.setFont("helvetica", "normal");
  const billToLines = [
    orden?.cliente_direccion || "Address not provided",
  ];

  const shipToLines = obtenerLineasShipTo(orden);
  const wrappedShip = shipToLines.flatMap((line) =>
    pdf.splitTextToSize(String(line || ""), boxWidth - 24),
  );

  let billY = y + 30;
  billToLines.forEach((line) => {
    pdf.text(String(line), billX + 18, billY);
    billY += 14;
  });

  let shipY = y + 30;
  wrappedShip.forEach((line) => {
    pdf.text(String(line), shipX + 18, shipY);
    shipY += 12;
  });

  y += boxHeight + 10;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Item No.", margin, y);
  pdf.text("Description", 120, y);
  pdf.text("Quantity", 350, y);
  pdf.text("Unit Price", 420, y);
  pdf.text("Total", 500, y);
  pdf.setDrawColor(180, 180, 180);
  pdf.line(margin, y + 4, pageWidth - margin, y + 4);

  pdf.setFont("helvetica", "normal");
  y += 18;
  const detalle = Array.isArray(orden?.detalle) ? orden.detalle : [];
  const subtotal = detalle.reduce(
    (sum, item) => sum + Number(item.subtotal ?? 0),
    0,
  );
  const total = Number(orden?.total ?? subtotal);

  detalle.forEach((item) => {
    if (y > pageHeight - 220) {
      pdf.addPage();
      y = 40;
    }

    const description = item.producto_nombre || item.descripcion || "Product";
    const itemNo = String(
      item.producto_sku || item.sku || item.codigo_producto || "-",
    );
    const quantity = Number(item.cantidad ?? 0);
    const unitPrice = Number(item.precio_unitario ?? item.precio ?? 0);
    const lineTotal = Number(item.subtotal ?? quantity * unitPrice);

    pdf.text(itemNo, margin, y);
    const descriptionLines = pdf.splitTextToSize(description, 210);
    descriptionLines.forEach((line, lineIndex) => {
      pdf.text(String(line), 120, y + lineIndex * 10);
    });
    pdf.text(String(quantity), 356, y);
    pdf.text(monedaUsd(unitPrice), 420, y);
    pdf.text(monedaUsd(lineTotal), 500, y);
    y += 18;
  });

  const startY = Math.min(y + 48, pageHeight - 200);
  const bottomY = dibujarPieYPago(pdf, {
    margin,
    pageWidth,
    startY,
    subtotal,
    total,
  });

  dibujarNotas(pdf, { margin, pageWidth, pageHeight, startY: bottomY + 34 });

  return pdf;
}

export async function generarFacturaPdf(factura) {
  (await crearPdf(factura)).save(`${factura.numero_factura}.pdf`);
}

export async function generarProformaPdf(orden) {
  if (!orden) return;
  (await crearProformaPdf(orden)).save(
    `PROFORMA-${String(orden.id).padStart(4, "0")}.pdf`,
  );
}

export async function imprimirFactura(factura) {
  const ventana = window.open("about:blank", "_blank");
  if (!ventana) {
    throw new Error("El navegador bloqueó la ventana de impresión.");
  }

  try {
    const pdf = await crearPdf(factura);
    const blobUrl = pdf.output("bloburl");
    ventana.addEventListener("load", () => ventana.print(), { once: true });
    ventana.location.href = blobUrl;
  } catch (error) {
    ventana.close();
    throw error;
  }
}
