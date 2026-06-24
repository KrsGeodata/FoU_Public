import React from "react";
import "./LoginPage.css";

interface LoginPageProps {
  onLoginSuccess: (personnr: string, firstName: string | null, bostedkommunenr: string | null) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [fodselsnummer, setFodselsnummer] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Backend login response includes names for lightweight header personalization.
  type LoginResponse = {
    owner_id?: number;
    full_name?: string | null;
    first_name?: string | null;
    bostedkommunenr?: string | null;
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fodselsnummer }),
      });

      if (response.status === 404) {
        setError("Fødselsnummeret ble ikke funnet.");
        return;
      }

      if (!response.ok) {
        setError("Noe gikk galt. Prøv igjen.");
        return;
      }

      const payload = (await response.json()) as LoginResponse;
      const firstName = typeof payload.first_name === "string" && payload.first_name.trim()
        ? payload.first_name.trim()
        : null;
      const fullName = typeof payload.full_name === "string" && payload.full_name.trim()
        ? payload.full_name.trim()
        : null;
      const bostedkommunenr = typeof payload.bostedkommunenr === "string" && payload.bostedkommunenr.trim()
        ? payload.bostedkommunenr.trim()
        : null;

      // Persist both the identifier and display name for the active session.
      sessionStorage.setItem("personnr", fodselsnummer);
      if (firstName) {
        sessionStorage.setItem("userFirstName", firstName);
      } else {
        sessionStorage.removeItem("userFirstName");
      }
      if (fullName) {
        sessionStorage.setItem("userFullName", fullName);
      } else {
        sessionStorage.removeItem("userFullName");
      }
      if (bostedkommunenr) {
        sessionStorage.setItem("bostedkommunenr", bostedkommunenr);
      } else {
        sessionStorage.removeItem("bostedkommunenr");
      }
      onLoginSuccess(fodselsnummer, firstName, bostedkommunenr);
    } catch {
      setError("Kunne ikke koble til serveren. Prøv igjen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-topbar">
        <span className="login-topbar-logo">ID-porten</span>
      </div>

      <div className="login-card">
        <h1 className="login-card-title">Logg inn</h1>
        <p className="login-card-subtitle">
          Skriv inn fødselsnummeret ditt for å fortsette.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="fodselsnummer">
            Fødselsnummer (11 siffer)
          </label>
          <input
            id="fodselsnummer"
            className="login-input"
            type="text"
            inputMode="numeric"
            pattern="\d{11}"
            maxLength={11}
            value={fodselsnummer}
            onChange={(e) => setFodselsnummer(e.target.value.replace(/\D/g, ""))}
            autoComplete="off"
            required
          />
          {error && <p className="login-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="login-submit"
            disabled={isLoading || fodselsnummer.length !== 11}
          >
            {isLoading ? "Logger inn…" : "Logg inn"}
          </button>
        </form>

        <div className="login-test-hint">
          <p className="login-test-hint-title">Testbrukere</p>
          <ul className="login-test-hint-list">
            {["11111111111", "12345678910", "10987654321"].map((nr) => (
              <li key={nr}>
                <button
                  type="button"
                  className="login-test-hint-btn"
                  onClick={() => setFodselsnummer(nr)}
                >
                  {nr}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
