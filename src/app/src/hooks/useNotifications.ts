import { useState } from "react";
import { useModal } from "../context/ModalContext";

export function useNotifications() {
  const { alert } = useModal();
  const [permission, setPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  const requestPermission = async () => {
    if (!window.isSecureContext) {
      alert(
        "Las notificaciones requieren una conexión segura (HTTPS). Si estás en local, usa localhost o un túnel seguro."
      );
      return;
    }

    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones.");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  return { permission, requestPermission };
}
