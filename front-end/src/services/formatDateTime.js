export function formatDateTimeCombined(isoString) {
  if (!isoString) return "-";
  const [date, time] = isoString.split("T");
  let cleanTime = time ? time.replace("Z", "") : "";
  cleanTime = cleanTime.replace(/\.000$/, ""); // retire le .000
  return `${date}\n${cleanTime.slice(0, 8)}`; // HH:mm:ss
}