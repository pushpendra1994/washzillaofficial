// Google Sheets webhook configuration.
// Paste the "Web app URL" you get after deploying google-apps-script.gs
// inside the Google Sheet (Extensions → Apps Script → Deploy → Web app).
//
// Example:
//   webAppUrl: "https://script.google.com/macros/s/AKfycbx.../exec"
export const sheetsConfig = {
  webAppUrl: "https://script.google.com/macros/s/AKfycbx0p-v7P9rT2VgQL8KqoY0CeM_St9NF1V1IsgauZgUgkb8HqqAcOCE07drg2KdN2ZAeUQ/exec",
};

export const hasSheetsConfig =
  typeof sheetsConfig.webAppUrl === "string" &&
  sheetsConfig.webAppUrl.startsWith("https://script.google.com/macros/s/") &&
  sheetsConfig.webAppUrl.endsWith("/exec");
