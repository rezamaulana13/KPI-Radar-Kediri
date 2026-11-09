import { activePeriod, db } from "../data/store";
export const selectedPeriod = (url: URL) => db.periods.find((p) => p.id === url.searchParams.get("period")) ?? activePeriod();
