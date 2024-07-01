import {
  PromocodeStatus,
  WeatherObservation,
} from "../domains/promocode.schema";
import { PromocodeRepository } from "../repositories/promocode.repository";
import { validatePromocodeUseCase } from "./validatePromocode.usecase";
const promocodeNameOne = "TEST_PROMOCODE_1";
const promocodeNameTwo = "TEST_PROMOCODE_2";
const promocodeNameThree = "TEST_PROMOCODE_3";

const promocodeFixture = [
  {
    name: promocodeNameOne,
    advantage: { percent: 20 },
    restrictions: [],
    active: false,
    containsWeatherRestriction: false,
  },
  {
    name: promocodeNameTwo,
    advantage: { percent: 20 },
    restrictions: [
      {
        weather: {
          is: WeatherObservation.CLEAR,
          temperatureCelsius: { eq: 20 },
        },
      },
    ],
    active: true,
    containsWeatherRestriction: true,
  },
  {
    name: promocodeNameThree,
    advantage: { percent: 20 },
    restrictions: [{ age: { eq: 40 } }],
    active: true,
    containsWeatherRestriction: false,
  },
];

describe("validatePromocodeUseCase", () => {
  const promocodeRepository = new PromocodeRepository();
  beforeAll(() => {
    promocodeFixture.forEach((promocode) => {
      promocodeRepository.saveNewPromocode(promocode.name, promocode);
    });
  });

  it("it should refuse to validate an inactive promocode", async () => {
    const result = await validatePromocodeUseCase({
      promocodeRepository,
      promocodeToValidate: promocodeNameOne,
      promocodeValidationArguments: {},
      fetchOpenWeatherData: jest.fn(() =>
        Promise.resolve({
          weatherObservation: WeatherObservation.CLEAR,
          temperatureCelsius: 20,
        })
      ),
    });
    expect(result).toEqual({
      promocode_name: undefined,
      status: PromocodeStatus.DENIED,
      errors: ["Invalid Promocode"],
    });
  });

  it("it should correctly validate a promocode with a weather restriction", async () => {
    const fetchOpenWeatherData = jest.fn(() =>
      Promise.resolve({
        weatherObservation: WeatherObservation.CLEAR,
        temperatureCelsius: 20,
      })
    );
    const result = await validatePromocodeUseCase({
      promocodeRepository,
      promocodeToValidate: promocodeNameTwo,
      promocodeValidationArguments: { location: { city: "Lyon" } },
      fetchOpenWeatherData,
    });
    expect(fetchOpenWeatherData).toHaveBeenCalledWith({ city: "Lyon" });
    expect(result).toEqual({
      promocode_name: promocodeNameTwo,
      status: PromocodeStatus.ACCEPTED,
      advantage: { percent: 20 },
    });
  });

  it("it should correctly validate a promocode without a weather restriction", async () => {
    const fetchOpenWeatherData = jest.fn(() =>
      Promise.resolve({
        weatherObservation: WeatherObservation.CLEAR,
        temperatureCelsius: 20,
      })
    );
    const result = await validatePromocodeUseCase({
      promocodeRepository,
      promocodeToValidate: promocodeNameThree,
      promocodeValidationArguments: { age: 40, location: { city: "Lyon" } },
      fetchOpenWeatherData,
    });
    expect(fetchOpenWeatherData).not.toHaveBeenCalled();
    expect(result).toEqual({
      promocode_name: promocodeNameThree,
      status: PromocodeStatus.ACCEPTED,
      advantage: { percent: 20 },
    });
  });
});
