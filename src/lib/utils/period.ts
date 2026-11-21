import { activePeriod, db } from "../data/store";
export const selectedPeriod = (url: URL) => {
  const reqId = url.searchParams.get("period");
  if (reqId) {
    const found = db.periods.find((p) => p.id === reqId && !p.name?.toLowerCase().includes("triwulan") && !p.id?.includes("-Q"));
    if (found) return found;
  }
  return activePeriod();
};
