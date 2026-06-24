export type AppView = "min-eiendom" | "byggesak" | "naboliste" | "avfall" | "avgifter";

export function toViewFromHash(hash: string): AppView {
  if (hash === "#byggesak") {
    return "byggesak";
  }
  if (hash === "#naboliste") {
    return "naboliste";
  }
  if (hash === "#avfall") {
    return "avfall";
  }
  if (hash === "#avgifter") {
    return "avgifter";
  }
  return "min-eiendom";
}

export function toHashFromView(view: AppView): string {
  if (view === "byggesak") {
    return "#byggesak";
  }
  if (view === "naboliste") {
    return "#naboliste";
  }
  if (view === "avfall") {
    return "#avfall";
  }
  if (view === "avgifter") {
    return "#avgifter";
  }
  return "#min-eiendom";
}
