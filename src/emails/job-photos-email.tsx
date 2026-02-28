export function buildJobPhotosEmail(params: {
  customerName: string;
  jobReference: string;
  photoUrls: string[];
  feedbackUrl: string;
  logoUrl: string;
  companyName: string;
  brandColor: string;
}): string {
  const { customerName, jobReference, photoUrls, feedbackUrl, logoUrl, companyName, brandColor } = params;

  const photoHtml = photoUrls
    .map(
      (url) =>
        `<tr><td style="padding: 8px 0;"><img src="${url}" alt="Job photo" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; display: block;" /></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Job Photos from ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 32px 32px 16px;">
              <img src="${logoUrl}" alt="${companyName}" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding: 16px 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; color: #111827;">Hi ${customerName},</h1>
              <p style="margin: 0 0 8px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                Thank you for choosing ${companyName}!
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                We've completed the work${jobReference ? ` at <strong>${jobReference}</strong>` : ""}, and here are your finished job photos:
              </p>
            </td>
          </tr>
          <!-- Photos -->
          <tr>
            <td style="padding: 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${photoHtml}
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #4b5563; line-height: 1.5;">
                We'd really appreciate hearing how we did! It takes less than 2 minutes and helps us keep improving our service.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="background-color: ${brandColor}; border-radius: 8px;">
                    <a href="${feedbackUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Share Your Feedback
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center; line-height: 1.5;">
                Thanks again,<br />The ${companyName} Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
