import { asset, parseDashboard, type Dashboard } from "./dashboard";
let request: Promise<Dashboard> | undefined;
export function readDashboard(): Promise<Dashboard> {
  if (!request)
    request = fetch(asset("data/dashboard.json"))
      .then((response) => {
        if (!response.ok) throw new Error("no pudimos cargar los datos");
        return response.json();
      })
      .then(parseDashboard)
      .catch((error) => {
        request = undefined;
        throw error;
      });
  return request;
}
