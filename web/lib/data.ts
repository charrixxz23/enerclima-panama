import raw from "../public/data/dashboard.json";
import { parseDashboard } from "./dashboard";
export const dashboard = parseDashboard(raw);
