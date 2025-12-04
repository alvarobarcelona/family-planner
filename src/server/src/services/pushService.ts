import webpush from "web-push";

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.warn(
    "WARNING: VAPID keys are missing in environment variables. Push notifications will not work."
  );
} else {
  webpush.setVapidDetails(
    "mailto:camase1990@gmail.com", // Replace with real email if needed
    publicVapidKey,
    privateVapidKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    // TODO: Handle 410 Gone (remove subscription)
    return false;
  }
}
