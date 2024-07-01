import { Promocode } from "../domains/promocode";
import { PromocodeRepository } from "./promocode.repository";

const PROMOCODE_FIXTURE: Promocode = {
  name: "test",
  advantage: { percent: 10 },
  restrictions: [],
  active: true,
  containsWeatherRestriction: false,
};

describe("promocode-repository.test.ts", () => {
  it("should correctly add a promocode to the datastore", () => {
    const promocodeRepository = new PromocodeRepository();

    const newPromocodeSaved = promocodeRepository.saveNewPromocode(
      PROMOCODE_FIXTURE.name,
      PROMOCODE_FIXTURE
    );

    expect(newPromocodeSaved).toBe(true);
    expect(promocodeRepository.get(PROMOCODE_FIXTURE.name)).toEqual(
      PROMOCODE_FIXTURE
    );
  });

  it("should correctly toggle the active state of a promocode to the datastore", () => {
    const promocodeRepository = new PromocodeRepository();

    promocodeRepository.saveNewPromocode(
      PROMOCODE_FIXTURE.name,
      PROMOCODE_FIXTURE
    );

    const newPromoCodeToggled = promocodeRepository.togglePromocodeActiveState(
      PROMOCODE_FIXTURE.name,
      false
    );

    expect(newPromoCodeToggled).toBe(true);
    expect(promocodeRepository.get(PROMOCODE_FIXTURE.name)?.active).toBe(false);
  });
});
