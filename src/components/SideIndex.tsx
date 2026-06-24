import { useNavigate } from "react-router-dom";
import { CATALOG } from "../data/catalog";
import { Logo } from "./Logo";

/** Workbench rail: brand + grouped navigation across all 95 screens. */
export function SideIndex({ current }: { current: string }) {
  const navigate = useNavigate();
  return (
    <nav className="afl-rail">
      <div className="afl-rail__brand">
        <Logo size={30} />
        <span className="afl-rail__brand-name">AFROLOC</span>
      </div>
      {CATALOG.map((group) => (
        <div key={group.title}>
          <div className="afl-rail__group">{group.title}</div>
          {group.screens.map((s) => (
            <button
              key={s.id}
              className={"afl-rail__item" + (s.id === current ? " is-active" : "")}
              onClick={() => navigate("/" + s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
