// Faithful re-implementation of the prototype's `wire()` augmentation.
// Given a mounted screen root, it assigns data-go / data-next / data-back
// attributes to interactive elements (by text/shape) exactly as the original
// streaming runtime did, so navigation behaves identically.

export const CREATE_FLOW = [
  "type",
  "location",
  "qgsq",
  "building",
  "informal",
  "witnesses",
] as const;

const TAB_MAP: Record<string, string> = {
  Início: "home",
  Moradas: "addresses",
  Mapa: "identitiesMap",
  Perfil: "profile",
  Painel: "adminDash",
  Utilizadores: "users",
  Relatórios: "reports",
  Segurança: "security",
  Sistema: "setup",
  Testemunha: "witnesses",
  "No mapa": "identitiesMap",
  Partilhar: "share",
  Nova: "type",
};

/** Mutates the screen DOM to attach navigation affordances. `screenId` is the
 *  currently shown screen so we can apply per-screen enhancements. */
export function wireScreen(root: HTMLElement, screenId: string): void {
  root.querySelectorAll("button").forEach((b) => {
    const btn = b as HTMLElement;
    if (btn.dataset.go || btn.dataset.next) {
      btn.style.cursor = "pointer";
      return;
    }
    const t = (btn.textContent || "").trim();
    if (t.indexOf("Criar a minha") === 0) btn.dataset.go = "type";
    else if (t === "Verificar" || t === "Começar") btn.dataset.go = "home";
    else if (t === "Continuar" || t === "Confirmar célula") btn.dataset.next = "1";
    else if (t.indexOf("Enviar para valid") === 0) btn.dataset.go = "detail";
    else if (t === "Ver edifício") btn.dataset.go = "buildingDir";
    else if (t.indexOf("Já tenho") > -1) btn.dataset.go = "otp";
    btn.style.cursor = "pointer";
  });

  root.querySelectorAll("span").forEach((s) => {
    const t = (s.textContent || "").trim();
    const target = TAB_MAP[t];
    if (target) {
      const p = s.parentElement as HTMLElement | null;
      if (p && !p.dataset.go) {
        p.dataset.go = target;
        p.style.cursor = "pointer";
      }
    }
  });

  // Back chevrons (M15 18l-6-6 6-6)
  root.querySelectorAll("path").forEach((p) => {
    if (p.getAttribute("d") === "M15 18l-6-6 6-6") {
      const svg = p.closest("svg");
      const btn = svg && (svg.parentElement as HTMLElement | null);
      if (btn) {
        btn.dataset.back = "1";
        btn.style.cursor = "pointer";
      }
    }
  });

  // Per-screen enhancements
  if (screenId === "home") {
    const hero = root.querySelector<HTMLElement>(
      'div[style*="background:#1A1814"][style*="border-radius:24px"]',
    );
    if (hero) {
      hero.dataset.go = "detail";
      hero.style.cursor = "pointer";
    }
  }
  if (screenId === "addresses") {
    root
      .querySelectorAll<HTMLElement>('div[style*="border-radius:18px"][style*="gap:13px"]')
      .forEach((c) => {
        c.dataset.go = "detail";
        c.style.cursor = "pointer";
      });
    const add = root.querySelector<HTMLElement>(
      'div[style*="background:#1A1814"][style*="width:40px"]',
    );
    if (add) {
      add.dataset.go = "type";
      add.style.cursor = "pointer";
    }
  }
  if (screenId === "detail") {
    const up = root.querySelector('path[d="M12 16V4M7 9l5-5 5 5"]');
    const b = up && (up.closest("div") as HTMLElement | null);
    if (b) {
      b.dataset.go = "share";
      b.style.cursor = "pointer";
    }
  }
  if (screenId === "location") {
    const pais = root.querySelector<HTMLElement>('div[style*="border-radius:13px"]');
    if (pais) {
      pais.dataset.go = "adminDivision";
      pais.style.cursor = "pointer";
    }
  }
}

export type NavAction =
  | { kind: "go"; id: string }
  | { kind: "next" }
  | { kind: "back" }
  | null;

/** Resolve a click within the screen to a navigation action. */
export function resolveClick(target: EventTarget | null): NavAction {
  if (!(target instanceof Element)) return null;
  const go = target.closest("[data-go]");
  if (go) return { kind: "go", id: go.getAttribute("data-go") || "" };
  const nav = target.closest("[data-nav]");
  if (nav) return { kind: "go", id: nav.getAttribute("data-nav") || "" };
  if (target.closest("[data-next]")) return { kind: "next" };
  if (target.closest("[data-back]")) return { kind: "back" };
  return null;
}

/** Next screen in the create-address flow, else 'detail'. */
export function nextInFlow(current: string): string {
  const i = (CREATE_FLOW as readonly string[]).indexOf(current);
  if (i > -1 && i < CREATE_FLOW.length - 1) return CREATE_FLOW[i + 1];
  return "detail";
}
