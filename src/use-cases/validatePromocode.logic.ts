import { parseISO } from "date-fns";
import { Promocode } from "../domains/promocode";
import {
  AgeRestriction,
  AndRestriction,
  Comparision,
  DateRestriction,
  OrRestriction,
  PromocodeValidationArguments,
  Restriction,
  RestrictionType,
  WeatherRestriction,
} from "../domains/promocode.schema";
import { FetchOpenWeatherDataByCityReturn } from "../clients/openweather";

export function validateComparison(
  restrictionComparison: Comparision,
  value: number
): true | string {
  if (restrictionComparison.eq != null) {
    return value === restrictionComparison.eq
      ? true
      : `Value must be equal to ${restrictionComparison.eq}, received ${value}`;
  }

  if (restrictionComparison.lt != null && restrictionComparison.gt == null) {
    return value <= restrictionComparison.lt
      ? true
      : `Value must be less than ${restrictionComparison.lt}, received ${value}`;
  }

  if (restrictionComparison.gt != null && restrictionComparison.lt == null) {
    return value >= restrictionComparison.gt
      ? true
      : `Value must be greater than ${restrictionComparison.gt}, received ${value}`;
  }

  if (restrictionComparison.gt != null && restrictionComparison.lt != null) {
    return value >= restrictionComparison.gt &&
      value <= restrictionComparison.lt
      ? true
      : `Value must be between ${restrictionComparison.gt} and ${restrictionComparison.lt}, received ${value}`;
  }
  // should never happen
  return "Invalid restriction recieved";
}

export function isAgeRestriction(
  restriction: unknown
): restriction is AgeRestriction {
  return (
    restriction != null &&
    typeof restriction === "object" &&
    RestrictionType.AGE in restriction
  );
}

export function validateAgeRestriction(
  restriction: AgeRestriction,
  restrictionArguments: PromocodeValidationArguments
): true | string {
  const age = restrictionArguments?.age;
  if (age == null) {
    return "Age is required for this promocode";
  }

  const restrictionComparison = restriction[RestrictionType.AGE];
  const result = validateComparison(restrictionComparison, age);

  if (typeof result === "string") {
    return `Age: ${result}`;
  }
  return true;
}

export function isDateRestriction(
  restriction: unknown
): restriction is DateRestriction {
  return (
    restriction != null &&
    typeof restriction === "object" &&
    RestrictionType.DATE in restriction
  );
}

export function validateDateRestriction(
  restriction: DateRestriction
): true | string {
  const date = new Date();
  const { before, after } = restriction[RestrictionType.DATE];

  return parseISO(before) >= date && parseISO(after) <= date
    ? true
    : "Date: Offer is not longer valid today";
}

export function isWeatherRestriction(
  restriction: unknown
): restriction is WeatherRestriction {
  return (
    restriction != null &&
    typeof restriction === "object" &&
    RestrictionType.WEATHER in restriction
  );
}

export function validateWeatherRestriction(
  restriction: WeatherRestriction,
  weatherData: FetchOpenWeatherDataByCityReturn
): true | string {
  const { weatherObservation, temperatureCelsius } = weatherData;

  const {
    is: restrictionWeatherObservation,
    temperatureCelsius: restrictionTemperatureCelsius,
  } = restriction[RestrictionType.WEATHER];

  if (weatherObservation !== restrictionWeatherObservation) {
    return `Weather must be ${restrictionWeatherObservation}, received ${weatherObservation}`;
  }

  if (weatherObservation === restrictionWeatherObservation) {
    if (restrictionTemperatureCelsius == null) {
      return true;
    }

    const result = validateComparison(
      restrictionTemperatureCelsius,
      temperatureCelsius
    );

    if (typeof result === "string") {
      return `Temperature: ${result}`;
    }

    return true;
  }
  // should never happen
  return "Temperature: Invalid weather restriction";
}

export function isAndRestriction(
  restriction: unknown
): restriction is AndRestriction {
  return (
    restriction != null &&
    typeof restriction === "object" &&
    RestrictionType.AND in restriction &&
    Array.isArray(restriction[RestrictionType.AND])
  );
}

export function isOrRestriction(
  restriction: unknown
): restriction is OrRestriction {
  return (
    restriction != null &&
    typeof restriction === "object" &&
    RestrictionType.OR in restriction &&
    Array.isArray(restriction[RestrictionType.OR])
  );
}

export function validateRestriction(
  restriction: Restriction,
  promocodeValidationArguments: PromocodeValidationArguments,
  weatherData?: FetchOpenWeatherDataByCityReturn
): { isValid: boolean; errors: string[] } {
  if (isAgeRestriction(restriction)) {
    const result = validateAgeRestriction(
      restriction,
      promocodeValidationArguments
    );
    return result === true
      ? { isValid: true, errors: [] }
      : { isValid: false, errors: [result] };
  }

  if (isDateRestriction(restriction)) {
    const result = validateDateRestriction(restriction);
    return result === true
      ? { isValid: true, errors: [] }
      : { isValid: false, errors: [result] };
  }

  if (isWeatherRestriction(restriction)) {
    if (!weatherData) {
      console.log(weatherData);
      return {
        isValid: false,
        errors: ["Weather data is required for this promocode"],
      };
    }
    const result = validateWeatherRestriction(restriction, weatherData);
    return result === true
      ? { isValid: true, errors: [] }
      : { isValid: false, errors: [result] };
  }

  if (isAndRestriction(restriction)) {
    const results = restriction[RestrictionType.AND].map((restriction) =>
      validateRestriction(
        restriction,
        promocodeValidationArguments,
        weatherData
      )
    );

    const isValid = results.every((result) => result.isValid);

    return isValid
      ? { isValid: true, errors: [] }
      : {
          isValid: false,
          errors: results.flatMap((result) => result.errors),
        };
  }
  if (isOrRestriction(restriction)) {
    const results = restriction[RestrictionType.OR].map((restriction) =>
      validateRestriction(
        restriction,
        promocodeValidationArguments,
        weatherData
      )
    );

    const isValid = results.some((result) => result.isValid);

    return isValid
      ? { isValid: true, errors: [] }
      : {
          isValid: false,
          errors: results.flatMap((result) => result.errors),
        };
  }

  return { isValid: false, errors: ["Unknown restriction type"] };
}

export function validatePromocode(
  promocode: Promocode,
  promocodeValidationArguments: PromocodeValidationArguments,
  weatherData?: FetchOpenWeatherDataByCityReturn
): { isValid: boolean; errors: string[] } {
  const validationResult = promocode.restrictions.map((restriction) =>
    validateRestriction(restriction, promocodeValidationArguments, weatherData)
  );

  const isValid = validationResult.every((result) => result.isValid);

  return {
    isValid,
    errors: validationResult.flatMap((result) => result.errors),
  };
}
