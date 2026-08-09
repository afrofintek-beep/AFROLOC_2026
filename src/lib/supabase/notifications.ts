// Notificações REAIS do utilizador — tabela `risk_alerts_log` do backend de
// produção (alertas de verificação/risco enviados ao cidadão pelo motor de
// risco/PoDP). Leitura por utilizador.
import { supabase } from "./client";

export interface AlertRow {
  id: string;
  message: string;
  alert_type: string;
  risk_score: number;
  sent_at: string;
}

/** Alertas/notificações do utilizador autenticado (mais recentes primeiro). */
export async function listMyAlerts(): Promise<AlertRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("risk_alerts_log")
    .select("id,message,alert_type,risk_score,sent_at")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(30);
  if (error) return [];
  return (data ?? []) as AlertRow[];
}

/** "há X min/h/dias" a partir de uma data ISO. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}
