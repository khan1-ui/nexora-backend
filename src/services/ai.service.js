const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const extractInvoiceData = async (filePath) => {
  try {
    const file = fs.readFileSync(filePath);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "invoice_schema",
          schema: {
            type: "object",
            properties: {
              clientName: { type: "string" },
              invoiceNumber: { type: "string" },
              issueDate: { type: "string" },
              dueDate: { type: "string" },
              totalAmount: { type: "number" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    quantity: { type: "number" },
                    price: { type: "number" },
                  },
                  required: ["description", "quantity", "price"],
                },
              },
            },
            required: [
              "clientName",
              "invoiceNumber",
              "issueDate",
              "dueDate",
              "items",
              "totalAmount",
            ],
          },
        },
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract structured invoice data from this document.",
            },
            {
              type: "input_file",
              file_data: file.toString("base64"),
            },
          ],
        },
      ],
    });

    return response.output_parsed;

  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
};

module.exports = { extractInvoiceData };