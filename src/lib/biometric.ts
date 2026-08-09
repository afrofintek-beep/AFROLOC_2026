// Bloqueio biométrico local (Face ID / impressão digital) via WebAuthn.
//
// É um BLOQUEIO DO DISPOSITIVO, não um login: regista uma passkey de plataforma
// (presa a este aparelho) e, ao abrir a app, exige verificação biométrica para
// desbloquear. Não envolve o backend nem substitui a palavra-passe.
const KEY_ENABLED = "afl.biometric.enabled";
const KEY_CRED = "afl.biometric.credId";

function randChallenge(len = 32): BufferSource {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return a as BufferSource;
}
function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function fromB64(s: string): BufferSource {
  const bin = atob(s);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a as BufferSource;
}

/** Há autenticador de plataforma (Face ID/digital) disponível? */
export async function biometricAvailable(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/** Está o bloqueio biométrico ativo neste dispositivo? */
export function biometricEnabled(): boolean {
  try {
    return localStorage.getItem(KEY_ENABLED) === "1" && !!localStorage.getItem(KEY_CRED);
  } catch {
    return false;
  }
}

/** Ativa: regista a passkey de plataforma. Devolve true se o utilizador aceitou. */
export async function enableBiometric(userId: string, userName: string): Promise<boolean> {
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: randChallenge(),
        rp: { name: "AFROLOC", id: location.hostname },
        user: { id: new TextEncoder().encode(userId) as BufferSource, name: userName, displayName: userName },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) return false;
    localStorage.setItem(KEY_CRED, toB64(cred.rawId));
    localStorage.setItem(KEY_ENABLED, "1");
    return true;
  } catch {
    return false;
  }
}

/** Desativa o bloqueio. */
export function disableBiometric(): void {
  try {
    localStorage.removeItem(KEY_ENABLED);
    localStorage.removeItem(KEY_CRED);
  } catch { /* */ }
}

/** Pede a verificação biométrica. Devolve true se desbloqueou. */
export async function unlockBiometric(): Promise<boolean> {
  try {
    const credId = localStorage.getItem(KEY_CRED);
    if (!credId) return false;
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: randChallenge(),
        allowCredentials: [{ type: "public-key", id: fromB64(credId) }],
        userVerification: "required",
        rpId: location.hostname,
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}
