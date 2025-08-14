/* ============================================================
   WhatsApp MVP — Gansta Caps
   - Prellena mensaje de compra al pulsar "Comprar ahora"
   - Usa data-atributos del botón para título y precio
   - No modifica estilos/colores
============================================================ */

(function () {
  const WHATSAPP_NUMBER = "573007274969"; // tu número en formato internacional
  const SHIPPING_HINT   = "Envío $10–12k";
  const DEFAULT_QTY     = 1;

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);

  // Construye el texto del mensaje
  const buildMessage = ({ title, price, qty }) => {
    const precio = typeof price === "number" ? price : parseInt(String(price).replace(/\D/g, ""), 10) || 0;
    return (
      `Hola 👋, quiero comprar:\n` +
      `• ${title}\n` +
      `Precio: ${formatCOP(precio)}\n` +
      `Cantidad: ${qty}\n` +
      `${SHIPPING_HINT}\n\n` +
      `Mis datos:\n` +
      `- Nombre:\n` +
      `- Ciudad:\n` +
      `- Método de pago:\n`
    );
  };

  // Para cada botón "Comprar ahora", generamos el enlace wa.me dinámico
  const init = () => {
    const botones = document.querySelectorAll(".btn-comprar");
    if (!botones.length) return;

    botones.forEach((btn) => {
      const title = btn.dataset.title?.trim()
        || btn.closest(".card-producto")?.querySelector(".card-titulo")?.textContent?.trim()
        || "Producto";

      const priceAttr = btn.dataset.price
        || btn.closest(".card-producto")?.querySelector(".card-precio")?.textContent
        || "0";

      const qty = DEFAULT_QTY;

      // Componemos el enlace y lo asignamos al <a>
      const text = encodeURIComponent(buildMessage({ title, price: priceAttr, qty }));
      const url  = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

      btn.setAttribute("href", url);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");

      // Si en el futuro quieres pedir cantidad, aquí puedes interceptar el click
      // y rearmar el URL según la cantidad seleccionada.
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();
