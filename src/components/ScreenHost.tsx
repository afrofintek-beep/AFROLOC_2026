import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SCREENS } from "../data/screens";
import { wireScreen, resolveClick, nextInFlow } from "../nav/wire";

/**
 * Renders one AFROLOC screen from the faithful design markup, applies the
 * prototype's navigation wiring, and routes clicks through React Router.
 */
export function ScreenHost({ screenId }: { screenId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const screen = SCREENS[screenId];

  useEffect(() => {
    const root = ref.current;
    if (!root || !screen) return;
    wireScreen(root, screenId);
  }, [screenId, screen]);

  function onClick(e: React.MouseEvent) {
    const action = resolveClick(e.target);
    if (!action) return;
    e.preventDefault();
    if (action.kind === "go") navigate("/" + action.id);
    else if (action.kind === "next") navigate("/" + nextInFlow(screenId));
    else if (action.kind === "back") navigate(-1);
  }

  if (!screen) {
    return (
      <div style={{ padding: 40, font: "500 14px Inter", color: "#8A8073" }}>
        Ecrã “{screenId}” não encontrado.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="afl-screen-host"
      onClick={onClick}
      // Faithful rendered markup from the design handoff (see data/screens.ts).
      dangerouslySetInnerHTML={{ __html: screen.html }}
    />
  );
}
