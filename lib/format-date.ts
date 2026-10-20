const formatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return formatter.format(new Date(iso));
}

const isoLocalFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" });

export function hoyEnColombia(): string {
  return isoLocalFormatter.format(new Date());
}
