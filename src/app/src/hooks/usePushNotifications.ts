import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    Notification.permission
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if SW is supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribeToPush = async (familyMemberId?: string) => {
    setLoading(true);
    try {
    
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker no soportado");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push Manager no soportado");
      }

     
      const registration = await navigator.serviceWorker.register("/sw.js");
    
      await navigator.serviceWorker.ready;
     
      const perm = await Notification.requestPermission();
      setPermission(perm);
  

      if (perm !== "granted") {
        throw new Error("Permiso denegado");
      }

      const response = await fetch(`${API_URL}/vapid-public-key`);
      if (!response.ok) {
        throw new Error(`Failed to fetch VAPID key: ${response.status}`);
      }
      const data = await response.json();
  

      if (!data.publicKey) {
        throw new Error("VAPID public key is missing from server response");
      }

      const { publicKey } = data;
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
    
     
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    
      const token = localStorage.getItem("token");

      const subscribeResponse = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        body: JSON.stringify({
          subscription,
          familyMemberId,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!subscribeResponse.ok) {
        throw new Error(
          `Failed to save subscription: ${subscribeResponse.status}`
        );
      }

      
      setIsSubscribed(true);
    
      alert("¡Notificaciones activadas correctamente!");
    } catch (error) {
      console.error("❌ Error subscribing to push:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al activar notificaciones: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    subscribeToPush,
    loading,
  };
}
