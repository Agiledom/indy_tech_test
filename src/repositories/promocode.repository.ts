import { DataStore } from "../framework/datastore";
import { Promocode } from "../domains/promocode";
import logger from "../framework/logger";

export class PromocodeRepository extends DataStore<Promocode> {
  saveNewPromocode(name: string, promocode: Promocode): boolean {
    if (this.store[name] !== undefined) {
      logger.warn(
        `[WARNING]: Overwriting previously assigned value with key: ${name}`
      );
    }
    this.set(name, promocode);
    return true;
  }

  togglePromocodeActiveState(name: string, active: boolean): boolean {
    const promocode = this.get(name);
    if (promocode === undefined) {
      logger.error("[ERROR]: Unable to find promocode to toggle");
      return false;
    }
    this.store = { ...this.store, [name]: { ...promocode, active } };
    return true;
  }
}
