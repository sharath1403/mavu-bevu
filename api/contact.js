const RESEND_API_URL = "https://api.resend.com/emails";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { name, phone, email, message } = request.body || {};

    // Basic server-side validation
    if (!name || !email || !message) {
      return response.status(400).json({
        success: false,
        message: "Name, email and message are required.",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return response.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return response.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    const emailResponse = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Mavubevu Website <contact@mavubevu.com>",
        to: ["YOUR_EMAIL@example.com"],
        reply_to: email,
        subject: `New Contact Us Message from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Us Message</h2>

            <p><strong>Name:</strong> ${escapeHtml(name)}</p>

            <p><strong>Mobile Number:</strong> ${escapeHtml(
          phone || "Not provided"
        )}</p>

            <p><strong>Email:</strong> ${escapeHtml(email)}</p>

            <p><strong>Message:</strong></p>

            <p style="white-space: pre-wrap;">
              ${escapeHtml(message)}
            </p>

            <hr>

            <p style="font-size: 12px; color: #666;">
              This message was submitted through the Mavubevu website.
            </p>
          </div>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", result);

      return response.status(500).json({
        success: false,
        message: "Unable to send email.",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Message sent successfully.",
      id: result.id,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return response.status(500).json({
      success: false,
      message: "Something went wrong while sending your message.",
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}