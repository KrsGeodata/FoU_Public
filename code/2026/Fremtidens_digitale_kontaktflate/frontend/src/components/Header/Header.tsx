import React from "react";
import "./Header.css";
import { useKommuneConfig } from "../../context/KommuneConfigContext";

interface HeaderProps {
  onLogout: () => void;
  // Optional first name shown next to the profile icon when logged in.
  firstName?: string | null;
  roles?: { type: "PERSON" | "ORG"; id: string; label: string }[];
  selectedRoleId?: string | null;
  isMobileNavOpen?: boolean;
  onToggleMobileNav?: () => void;
  onRoleChange?: (roleId: string) => void;
}

/** Top header bar with logo, profile image, role chooser and logout action. */
export default function Header({
  onLogout,
  firstName,
  roles = [],
  selectedRoleId = null,
  isMobileNavOpen = false,
  onToggleMobileNav,
  onRoleChange,
}: HeaderProps) {
  const { config, apiBaseUrl } = useKommuneConfig();
  const logoutIconSrc = `${import.meta.env.BASE_URL}logOut.svg`;
  // logo_url is a relative /media/... path — route it through the backend CMS media proxy.
  const logoSrc = config?.logo_url ? `${apiBaseUrl}/cms${config.logo_url}` : "";
  const logoAlt = config?.name ?? "Kommune";

  const [isRoleMenuOpen, setIsRoleMenuOpen] = React.useState(false);
  const profileGroupRef = React.useRef<HTMLDivElement | null>(null);

  const activeRole = React.useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const activeRoleLabel = activeRole?.label ?? null;
  const isActiveOrgRole = activeRole?.type === "ORG";
  const profileIconClass = `profile-icon${isActiveOrgRole ? " profile-icon--org" : ""}`;

  const hasOrgRole = roles.some((role) => role.type === "ORG");

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!profileGroupRef.current || !target) {
        return;
      }
      if (!profileGroupRef.current.contains(target)) {
        setIsRoleMenuOpen(false);
      }
    }

    if (isRoleMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRoleMenuOpen]);

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="logo-link" aria-label="Gå til forsiden">
          <img
            src={logoSrc}
            alt={logoAlt}
            className="logo"
          />
        </a>

        <div className="header-right">
          <div className="profile-group" ref={profileGroupRef}>
            {hasOrgRole ? (
              <button
                type="button"
                className="profile-button"
                aria-haspopup="menu"
                aria-expanded={isRoleMenuOpen}
                onPointerDown={(event) => {
                  event.preventDefault();
                  setIsRoleMenuOpen((open) => !open);
                }}
              >
                <span className={profileIconClass} aria-hidden="true" />
                <span
                  className="profile-name"
                  title={activeRoleLabel ?? firstName ?? "Profil"}
                >
                  {activeRoleLabel ?? firstName ?? "Profil"}
                </span>
                <span className="profile-caret" aria-hidden="true">▾</span>
              </button>
            ) : (
              <>
                <span className={profileIconClass} aria-hidden="true" />
                <span className="profile-name">{firstName ?? "Profil"}</span>
              </>
            )}
            {hasOrgRole && isRoleMenuOpen ? (
              <div className="profile-menu" role="menu" aria-label="Velg rolle">
                {roles.map((role) => (
                  <button
                    key={`${role.type}-${role.id}`}
                    type="button"
                    className="profile-menu-item"
                    role="menuitem"
                    onPointerDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      onRoleChange?.(role.id);
                      setIsRoleMenuOpen(false);
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button className="logout-button" onClick={onLogout}>
            <span className="logout-text">Logg ut</span>
            <img
              src={logoutIconSrc}
              alt=""
              className="logout-icon"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className={isMobileNavOpen ? "header-nav-toggle is-open" : "header-nav-toggle"}
            aria-expanded={isMobileNavOpen}
            aria-controls="navigation-menu"
            aria-label={isMobileNavOpen ? "Lukk meny" : "Apne meny"}
            onClick={onToggleMobileNav}
          >
            <span className="header-nav-toggle-icon" aria-hidden="true">
              <span className="header-nav-toggle-bar" />
              <span className="header-nav-toggle-bar" />
              <span className="header-nav-toggle-bar" />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
