import { WeatherObservation } from "../domains/promocode.schema";
import { PromocodeRepository } from "../repositories/promocode.repository";
import { createPromocodeUseCase } from "./createPromocode.usecase";

describe("createPromocodeUseCase", () => {
  it("correctly creates a new promocode without a weather observation", () => {
    const promocodeRepository = new PromocodeRepository();
    const promocodeToAdd = {
      name: "TEST_PROMOCODE",
      advantage: { percent: 20 },
      restrictions: [
        {
          date: {
            before: "2022-01-01",
            after: "2021-01-01",
          },
        },
      ],
    };
    const promocodeCreated = createPromocodeUseCase({
      promocodeRepository,
      promocodeToAdd,
    });

    expect(promocodeCreated).toBe(true);
    expect(promocodeRepository.get(promocodeToAdd.name)).toEqual({
      ...promocodeToAdd,
      active: true,
      containsWeatherRestriction: false,
    });
  });
  it("correctly creates a new promocode with a weather observation", () => {
    const promocodeRepository = new PromocodeRepository();
    const promocodeToAdd = {
      name: "TEST_PROMOCODE",
      advantage: { percent: 20 },
      restrictions: [
        {
          date: {
            before: "2022-01-01",
            after: "2021-01-01",
          },
        },
        {
          or: [
            {
              weather: {
                is: WeatherObservation.ATMOSPHERE,
                temperatureCelsius: { gt: 21 },
              },
            },
            {
              age: { gt: 60 },
            },
          ],
        },
      ],
    };
    const promocodeCreated = createPromocodeUseCase({
      promocodeRepository,
      promocodeToAdd,
    });

    expect(promocodeCreated).toBe(true);
    expect(promocodeRepository.get(promocodeToAdd.name)).toEqual({
      ...promocodeToAdd,
      active: true,
      containsWeatherRestriction: true,
    });
  });
});
