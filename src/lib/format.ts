const TZ = "Asia/Kolkata";

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 150000 -> "₹1,50,000", 0 -> "Free" */
export function formatPrice(rupees: number): string {
  return rupees === 0 ? "Free" : rupee.format(rupees);
}

const dateParts = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** -> "Sat, 18 Oct, 6:30 PM" (always shown in IST so server and browser agree) */
export function formatEventDate(value: string | Date): string {
  const parts = Object.fromEntries(
    dateParts.formatToParts(new Date(value)).map((p) => [p.type, p.value]),
  );
  return `${parts.weekday}, ${parts.day} ${parts.month}, ${parts.hour}:${parts.minute} ${parts.dayPeriod?.toUpperCase()}`;
}
