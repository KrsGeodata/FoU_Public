import React from "react";
import "./NavigationBar.css";

type NavigationView = "min-eiendom" | "byggesak" | "naboliste" | "avfall" | "avgifter";

type NavigationbarProps = {
  activeView?: NavigationView;
  onNavigate?: (view: NavigationView) => void;
  onLogout?: () => void;
  isMenuOpen?: boolean;
};

const navigationItems: Array<{ view: NavigationView; label: string; href: string }> = [
  { view: "min-eiendom", label: "Min Eiendom", href: "#min-eiendom" },
  { view: "byggesak", label: "Byggesak", href: "#byggesak" },
  { view: "naboliste", label: "Naboliste", href: "#naboliste" },
  { view: "avfall", label: "Avfall", href: "#avfall" },
  { view: "avgifter", label: "Avgifter", href: "#avgifter" },
];

/** Top navigation bar */
export default function Navigationbar({
  activeView = "min-eiendom",
  onNavigate,
  onLogout,
  isMenuOpen = false,
}: NavigationbarProps) {
  const logoutIconSrc = `${import.meta.env.BASE_URL}logOut.svg`;
  const firstLinkRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    if (isMenuOpen) {
      firstLinkRef.current?.focus();
    }
  }, [isMenuOpen]);

  function handleNavigate(event: React.MouseEvent<HTMLAnchorElement>, view?: NavigationView) {
    if (!view || !onNavigate) {
      return;
    }
    event.preventDefault();
    onNavigate(view);
  }

  return (
    <nav className={isMenuOpen ? "nav is-open" : "nav"} aria-label="Hovednavigasjon">
      <div className="nav-inner">
        <div
          id="navigation-menu"
          className={isMenuOpen ? "nav-links is-open" : "nav-links"}
        >
          {navigationItems.map(({ view, label, href }) => (
            <a
              key={view}
              ref={view === navigationItems[0].view ? firstLinkRef : undefined}
              className={activeView === view ? "nav-link active" : "nav-link"}
              href={href}
              onClick={(event) => handleNavigate(event, view)}
            >
              {label}
            </a>
          ))}
          {onLogout ? (
            <button
              type="button"
              className="nav-logout-button"
              onClick={onLogout}
            >
              <span>Logg ut</span>
              <img
                src={logoutIconSrc}
                alt=""
                className="nav-logout-icon"
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
