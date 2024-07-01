import { addDays, format, subDays } from "date-fns";
import {
  validateAgeRestriction,
  validateComparison,
  validateDateRestriction,
  validatePromocode,
  validateWeatherRestriction,
} from "./validatePromocode.logic";
import {
  PromocodeValidationArguments,
  WeatherObservation,
} from "../domains/promocode.schema";
import { Promocode } from "../domains/promocode";

describe("validatePromocode.logic.test.ts", () => {
  describe("validateComparison", () => {
    it("should return that the comparison is invalid", () => {
      const isValid = validateComparison({}, 50);
      expect(isValid).toBe("Invalid restriction recieved");
    });

    it("when eq is in the restriction, it should correctly validate the comparison", () => {
      const isValid = validateComparison({ eq: 50 }, 50);
      expect(isValid).toBe(true);

      const isValid2 = validateComparison({ eq: 50 }, 60);
      expect(isValid2).toBe("Value must be equal to 50, received 60");
    });

    it("when gt and lt are in the restriction, it should correctly validate the comparison", () => {
      const isValid = validateComparison({ gt: 50 }, 40);
      expect(isValid).toBe("Value must be greater than 50, received 40");

      const isValid3 = validateComparison({ lt: 70 }, 80);
      expect(isValid3).toBe("Value must be less than 70, received 80");

      const isValid2 = validateComparison({ gt: 50, lt: 70 }, 40);
      expect(isValid2).toBe("Value must be between 50 and 70, received 40");
    });
  });

  describe("validateAgeRestriction", () => {
    it("should return that an age is required", () => {
      const isValid = validateAgeRestriction(
        { age: {} },
        {
          age: undefined,
        }
      );
      expect(isValid).toBe("Age is required for this promocode");
    });

    it("should return that the age restriction passed is invalid", () => {
      const isValid = validateAgeRestriction({ age: {} }, { age: 50 });
      expect(isValid).toBe("Age: Invalid restriction recieved");
    });

    it("should correctly validate the age restriction when its equal", () => {
      const isValid = validateAgeRestriction(
        { age: { eq: 50 } },
        {
          age: 50,
        }
      );
      expect(isValid).toBe(true);
    });

    it("should correctly validate the age restriction when its in range", () => {
      const isValid = validateAgeRestriction(
        { age: { gt: 50, lt: 70 } },
        {
          age: 60,
        }
      );
      expect(isValid).toBe(true);
    });
  });

  describe("validateDateRestriction", () => {
    it("should return that coupon is outside of the date range", () => {
      const isValid = validateDateRestriction({
        date: {
          before: "2022-01-01T00:00:00.000Z",
          after: "2021-01-01T00:00:00.000Z",
        },
      });
      expect(isValid).toBe("Date: Offer is not longer valid today");
    });

    it("should return that coupon is inside of the date range", () => {
      const isValid = validateDateRestriction({
        date: {
          before: format(new Date(), "yyyy-MM-dd"),
          after: "2021-01-01",
        },
      });
      expect(isValid).toBe("Date: Offer is not longer valid today");
    });
  });

  describe("validateWeatherRestriction", () => {
    it("should return that the weather restriction is invalid", () => {
      const isValid = validateWeatherRestriction(
        {
          weather: { is: WeatherObservation.CLEAR },
        },
        {
          weatherObservation: WeatherObservation.ATMOSPHERE,
          temperatureCelsius: 20,
        }
      );

      expect(isValid).toBe(
        `Weather must be ${WeatherObservation.CLEAR}, received ${WeatherObservation.ATMOSPHERE}`
      );
    });

    it("should return that the weather restriction is valid", () => {
      const isValid = validateWeatherRestriction(
        {
          weather: { is: WeatherObservation.CLEAR },
        },
        {
          weatherObservation: WeatherObservation.CLEAR,
          temperatureCelsius: 20,
        }
      );

      expect(isValid).toBe(true);
    });
  });

  describe("validatePromocode", () => {
    it("should return all the errors that make the promocode invalid", () => {
      const promocode: Promocode = {
        name: "TEST",
        restrictions: [
          {
            date: {
              before: format(subDays(new Date(), 2), "yyyy-MM-dd"),
              after: "2021-01-01",
            },
          },
          {
            weather: { is: WeatherObservation.CLEAR },
          },
          {
            and: [
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
        advantage: { percent: 10 },
        active: true,
        containsWeatherRestriction: true,
      };
      const promocodeValidationArguments: PromocodeValidationArguments = {
        age: 50,
        location: {
          city: "London",
        },
      };

      const weatherData = {
        weatherObservation: WeatherObservation.DRIZZLE,
        temperatureCelsius: 20,
      };

      const { isValid, errors } = validatePromocode(
        promocode,
        promocodeValidationArguments,
        weatherData
      );

      expect(isValid).toBe(false);
      expect(errors).toEqual([
        "Date: Offer is not longer valid today",
        "Weather must be Clear, received Drizzle",
        "Weather must be Atmosphere, received Drizzle",
        "Age: Value must be greater than 60, received 50",
      ]);
    });

    it("should return that the promocode is valid", () => {
      const promocode: Promocode = {
        name: "TEST",
        restrictions: [
          {
            date: {
              before: format(addDays(new Date(), 2), "yyyy-MM-dd"),
              after: "2021-01-01",
            },
          },
          {
            and: [
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
        advantage: { percent: 10 },
        active: true,
        containsWeatherRestriction: true,
      };
      const promocodeValidationArguments: PromocodeValidationArguments = {
        age: 70,
        location: {
          city: "London",
        },
      };

      const weatherData = {
        weatherObservation: WeatherObservation.ATMOSPHERE,
        temperatureCelsius: 22,
      };

      const { isValid, errors } = validatePromocode(
        promocode,
        promocodeValidationArguments,
        weatherData
      );

      expect(isValid).toBe(true);
      expect(errors).toEqual([]);
    });
  });
});
