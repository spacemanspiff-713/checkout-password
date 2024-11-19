import { json } from "@remix-run/node"; // For response handling
import crypto from "crypto"; // For HMAC validation

export const loader = async () => {
  // Webhooks should not use GET requests
  return json({ message: "Method not allowed" }, { status: 405 });
};

export const action = async ({ request }) => {
  const SHARED_SECRET = process.env.SHOPIFY_SHARED_SECRET;

  // Get raw request body for HMAC validation
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  // Validate HMAC
  const hash = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  if (hash !== hmacHeader) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  // Parse the webhook payload
  const payload = JSON.parse(rawBody);
  const { customer, note_attributes } = payload;

  // Extract the password from note attributes
  const passwordAttribute = note_attributes?.find(
    (attr) => attr.name === "accountPassword"
  );

  if (customer && passwordAttribute?.value) {
    try {
      // Use Shopify Admin API to create the customer account
      const response = await fetch(
        `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2023-10/customers.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: {
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              password: passwordAttribute.value,
              password_confirmation: passwordAttribute.value,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create customer: ${errorText}`);
      }

      return json({ message: "Customer account created successfully" });
    } catch (error) {
      console.error("Error creating customer account:", error);
      return json({ message: "Error creating customer account" }, { status: 500 });
    }
  }

  return json({ message: "No password provided" }, { status: 400 });
};
