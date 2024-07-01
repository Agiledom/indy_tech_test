import { PromocodeRepository } from "../repositories/promocode.repository";
import { toggleActivationPromocodeUseCase } from "./toggleActivationPromocode.usecase";

describe("toggleActivationPromocodeUseCase", () => {
  it("should toggle the promocode activation status", () => {
    const promocodeRepository = new PromocodeRepository();
    const promocodeName = "TEST_PROMOCODE";
    const promocodeToAdd = {
      name: promocodeName,
      advantage: { percent: 20 },
      restrictions: [],
      active: false,
      containsWeatherRestriction: false,
    };

    promocodeRepository.saveNewPromocode(promocodeName, promocodeToAdd);

    const toggled = toggleActivationPromocodeUseCase({
      promocodeRepository,
      promocodeName,
      active: true,
    });
    expect(toggled).toBe(true);
    const promocode = promocodeRepository.get(promocodeName);
    expect(promocode).toBeDefined();
    expect(promocode?.active).toBe(true);
  });
});
