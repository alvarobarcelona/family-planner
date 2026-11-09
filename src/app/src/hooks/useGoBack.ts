import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Go back to the previous screen, or Home when there is no in-app history
 * (screen opened directly by URL or from the installed PWA), so navigate(-1)
 * never leaves the app.
 */
export function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key === "default") navigate("/", { replace: true });
    else navigate(-1);
  }, [location.key, navigate]);
}
