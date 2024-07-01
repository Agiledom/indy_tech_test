import { Advantage, Restriction } from "./promocode.schema";

export interface Promocode {
  name: string;
  advantage: Advantage;
  restrictions: Restriction[];
  active: boolean;
  containsWeatherRestriction: boolean;
}
