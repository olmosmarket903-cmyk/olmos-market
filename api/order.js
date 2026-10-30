export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(503).json({
      error: "Telegram sozlamalari kiritilmagan"
    });
  }

  const { name, phone, address = "", items } = req.body || {};

  if (!name || !phone || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Ma'lumotlar to'liq emas" });
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const message = [
    "🛒 YANGI BUYURTMA — OLMOS MARKET",
    "",
    `👤 Ism: ${name}`,
    `📞 Telefon: ${phone}`,
    `📍 Manzil: ${address}`,
    "",
    "Mahsulotlar:",
    ...items.map(item =>
      `${item.name} × ${item.quantity} — ${(
        item.price * item.quantity
      ).toLocaleString("uz-UZ")} so'm`
    ),
    "",
    `Jami: ${total.toLocaleString("uz-UZ")} so'm`
  ].join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return res.status(502).json({ error: "Telegram xatosi" });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    return res.status(500).json({ error: "Server xatosi" });
  }
}
