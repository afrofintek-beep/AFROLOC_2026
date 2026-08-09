// Foto de perfil — carrega para o Storage (bucket público "avatars") e guarda o
// URL em `profiles.avatar_url`. Requer, no backend: o bucket "avatars" (leitura
// pública) e a coluna `profiles.avatar_url` (ver docs/sql/afroloc_avatar.sql).
import { supabase } from "./client";
import { updateProfile } from "./profiles";

const BUCKET = "avatars";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Carrega a foto de perfil e devolve o URL público (com cache-bust). */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha uma imagem.");
  if (file.size > MAX_BYTES) throw new Error("Imagem demasiado grande (máx. 5 MB).");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const up = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
  });
  if (up.error) throw up.error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = `${data.publicUrl}?t=${Date.now()}`; // força o browser a buscar a nova
  await updateProfile(userId, { avatar_url: url });
  return url;
}
