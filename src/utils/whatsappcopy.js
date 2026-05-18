const axios = require("axios");

exports.sendWhatsAppMessage = async ({
            to,
            name,
            orderId,
            bookingDate,
            pickupLocation,
            pickupDateTime,
            persons,
            amount,
            invoiceUrl,
            phone
          }) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: "tour_order_created_button",
          language: {
            code: "en"
          },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: name },              // {{1}}
                { type: "text", text: orderId },           // {{2}}
                { type: "text", text: bookingDate },       // {{3}}
                { type: "text", text: pickupLocation },    // {{4}}
                { type: "text", text: pickupDateTime },    // {{5}}
                { type: "text", text: persons.toString() },// {{6}}
                { type: "text", text: amount.toString() }, // {{7}}
                { type: "text", text: invoiceUrl },        // {{8}}
                { type: "text", text: phone }              // {{9}}
              ]
            },
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("WhatsApp Error:", error.response?.data);
    throw error;
  }
};
