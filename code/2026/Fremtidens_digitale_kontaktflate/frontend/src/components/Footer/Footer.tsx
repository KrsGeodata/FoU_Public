import "./Footer.css";
import { useKommuneConfig } from "../../context/KommuneConfigContext";

export default function Footer() {
  const { config } = useKommuneConfig();
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="krsFooter" aria-label="Footer">
      <button
        className="krsFooter__toTop"
        type="button"
        aria-label="Til toppen"
        onClick={scrollToTop}
      >
        ↑
      </button>

      <div className="krsFooter__inner">
        <div className="krsFooter__grid">
          <section className="krsFooter__col" aria-labelledby="krsFooter-kontakt">
            <h2 className="krsFooter__title" id="krsFooter-kontakt">
              KONTAKT
            </h2>

            {config?.contact.phone && (
              <p className="krsFooter__line">
                <a className="krsFooter__link" href={`tel:${config.contact.phone.replace(/\s/g, "")}`}>
                  Sentralbord: {config.contact.phone}
                </a>
              </p>
            )}

            {config?.contact.email && (
              <p className="krsFooter__line">
                E-post:{" "}
                <a className="krsFooter__link" href={`mailto:${config.contact.email}`}>
                  {config.contact.email}
                </a>
              </p>
            )}

            {config?.org_number && (
              <p className="krsFooter__line">Org.nr: {config.org_number}</p>
            )}

            <p className="krsFooter__muted">© {year} {config?.name ?? "Kommune"}</p>
          </section>

          {/* Column 2: visiting address */}
          <section className="krsFooter__col" aria-labelledby="krsFooter-besok">
            <h2 className="krsFooter__title" id="krsFooter-besok">
              BESØKSADRESSE
            </h2>

            {config?.contact.visiting_address_line1 && (
              <p className="krsFooter__line">{config.contact.visiting_address_line1}</p>
            )}
            {config?.contact.visiting_address_line2 && (
              <p className="krsFooter__line">{config.contact.visiting_address_line2}</p>
            )}
          </section>

          {/* Column 3: opening hours */}
          <section className="krsFooter__col" aria-labelledby="krsFooter-apning">
            <h2 className="krsFooter__title" id="krsFooter-apning">
              ÅPNINGSTIDER
            </h2>

            {config?.contact.opening_hours?.map((line, i) => (
              <p key={i} className="krsFooter__line">{line}</p>
            ))}

            {config?.contact.website && (
              <p className="krsFooter__line">
                <a className="krsFooter__link" href={config.contact.website}>
                  Kontakt oss
                </a>
              </p>
            )}
          </section>
        </div>
      </div>
    </footer>
  );
}
