import { useEffect, useState } from "react";

// "Modo telemóvel": a app corre num ecrã de telemóvel real ou instalada
// (PWA/nativa em standalone). Nesse caso, a UI deve PREENCHER o ecrã — sem a
// moldura decorativa de telemóvel do handoff (que só faz sentido no desktop).
function detect(): boolean {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const narrow = window.matchMedia?.("(max-width: 480px)").matches;
  return !!(standalone || narrow);
}

export function usePhoneMode(): boolean {
  const [phone, setPhone] = useState(detect);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const on = () => setPhone(detect());
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return phone;
}
