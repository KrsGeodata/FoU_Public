import { WasteItem } from "../../types/waste";

type WasteCardProps = {
  item: WasteItem;
};

function parsePickupDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const norwegianDateMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(trimmed);
  if (norwegianDateMatch) {
    const day = Number.parseInt(norwegianDateMatch[1], 10);
    const month = Number.parseInt(norwegianDateMatch[2], 10);
    const year = Number.parseInt(norwegianDateMatch[3], 10);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year
      && date.getMonth() === month - 1
      && date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!isoDateMatch) {
    return null;
  }

  const year = Number.parseInt(isoDateMatch[1], 10);
  const month = Number.parseInt(isoDateMatch[2], 10);
  const day = Number.parseInt(isoDateMatch[3], 10);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function toFormattedPickupLabel(value: string): string | null {
  const parsedDate = parsePickupDate(value);
  if (!parsedDate) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const label = formatter.format(parsedDate);
  if (!label) {
    return null;
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Main purpose: Display one waste card with icon, labels, and pickup placeholders. */
export default function WasteCard({
  item,
}: WasteCardProps) {
  const nextPickups = [
    item.nextPickups?.[0] ?? "",
    item.nextPickups?.[1] ?? "",
    item.nextPickups?.[2] ?? "",
  ];
  const isMainPickupNote = nextPickups[0].toLowerCase().includes("ingen");
  const showFollowPickups = !isMainPickupNote;
  const mainPickupClassName = isMainPickupNote
    ? "pickup-next-main pickup-next-main-note"
    : "pickup-next-main";
  const mainPickupLabel = isMainPickupNote
    ? nextPickups[0] || " "
    : toFormattedPickupLabel(nextPickups[0]) ?? nextPickups[0] ?? " ";

  return (
    <article className="pickup-row">
      <div className="pickup-head">
        <div className="pickup-img-wrap" aria-hidden="true">
          <img src={item.img} alt="" className="pickup-img" />
        </div>

        <div className="pickup-info">
          <h2 className="pickup-title">{item.title}</h2>
          <p className="pickup-freq">{item.frequency ?? " "}</p>
        </div>
      </div>

      <div className="pickup-next-list" aria-label={`Neste tømming for ${item.title}`}>
        {showFollowPickups ? (
          <div className="pickup-next-kicker-row">
            <p className="pickup-next-kicker">NESTE TØMMING</p>
          </div>
        ) : null}
        <p className={mainPickupClassName}>{mainPickupLabel}</p>
        {showFollowPickups ? (
          <>
            <p className="pickup-next-subtitle">Neste to tømminger</p>
            <p className="pickup-next-follow">{nextPickups[1] || " "}</p>
            <p className="pickup-next-follow">{nextPickups[2] || " "}</p>
          </>
        ) : null}
      </div>
    </article>
  );
}
