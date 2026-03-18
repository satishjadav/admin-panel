const axios = require("axios");

exports.sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "template",
        template: {
          name: "hello_world", // Meta ka default template
          language: { code: "en_US" }
        }
        // type: "text",
        // text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("WhatsApp Error:", error.response?.data);
    throw error;
  }
};
