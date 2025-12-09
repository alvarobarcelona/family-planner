const https = require("https");

const url =
  process.env.WEB_SERVICE_URL || "https://family-planner-backend-ugxx.onrender.com";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("ERROR: CRON_SECRET environment variable is not set");
  process.exit(1);
}

console.log(`Triggering notification check at ${new Date().toISOString()}`);
console.log(`Target URL: ${url}/api/cron/check-notifications`);

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
};

const req = https.get(`${url}/api/cron/check-notifications`, options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log("Response:", data);

    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log(
        `✅ Success - Sent ${result.notificationsSent} notifications`
      );
      process.exit(0);
    } else {
      console.error("❌ Failed to trigger notifications");
      process.exit(1);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request error:", error.message);
  process.exit(1);
});

req.setTimeout(30000, () => {
  console.error("❌ Request timeout after 30 seconds");
  req.destroy();
  process.exit(1);
});
