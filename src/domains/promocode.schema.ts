import { z } from "zod";

export enum RestrictionType {
  AGE = "age",
  AND = "and",
  DATE = "date",
  OR = "or",
  WEATHER = "weather",
}

export enum WeatherObservation {
  ATMOSPHERE = "Atmosphere",
  CLEAR = "Clear",
  CLOUDS = "Clouds",
  DRIZZLE = "Drizzle",
  RAIN = "Rain",
  SNOW = "Snow",
  THUNDERSTORM = "Thunderstorm",
}

export enum AdvantageType {
  PERCENTAGE = "percent",
  FIXED = "fixed",
}

const restrictions = z.nativeEnum(RestrictionType);
const weatherObservation = z.nativeEnum(WeatherObservation);
const advantageType = z.nativeEnum(AdvantageType);

const comparision = z
  .object({
    gt: z.number().optional(),
    lt: z.number().optional(),
    eq: z.number().optional(),
  })
  .refine(
    ({ gt, lt, eq }) => {
      if (eq === undefined && gt === undefined && lt === undefined) {
        return false;
      }
      if (eq !== undefined && (gt !== undefined || lt !== undefined)) {
        return false;
      }
      return true;
    },
    {
      message: "You must pass eq, or lt and/or gt",
    }
  );

export type Comparision = z.infer<typeof comparision>;

// TODO: add some validation for age
const ageRestriction = z.object({
  [restrictions.enum.AGE]: comparision,
});

export type AgeRestriction = z.infer<typeof ageRestriction>;

const weatherRestriction = z.object({
  [restrictions.enum.WEATHER]: z.object({
    is: weatherObservation,
    temperatureCelsius: comparision.optional(),
  }),
});

export type WeatherRestriction = z.infer<typeof weatherRestriction>;

const dateRestriction = z.object({
  [restrictions.enum.DATE]: z.object({
    before: z.string().date(),
    after: z.string().date(),
  }),
});

export type DateRestriction = z.infer<typeof dateRestriction>;

const andRestriction = z.object({
  [restrictions.enum.AND]: z.lazy(() => z.array(restriction)),
});

export type AndRestriction = z.infer<typeof andRestriction>;

const orRestriction = z.object({
  [restrictions.enum.OR]: z.lazy(() => z.array(restriction)),
});

export type OrRestriction = z.infer<typeof orRestriction>;

const restriction: z.ZodType<Restriction> = z.lazy(() =>
  z.union([
    ageRestriction,
    weatherRestriction,
    dateRestriction,
    andRestriction,
    orRestriction,
  ])
);

export type Restriction =
  | z.infer<typeof ageRestriction>
  | z.infer<typeof dateRestriction>
  | z.infer<typeof weatherRestriction>
  | {
      [restrictions.enum.OR]: Restriction[];
    }
  | { [restrictions.enum.AND]: Restriction[] };

const percentageAdvantage = z.object({
  [advantageType.enum.PERCENTAGE]: z.number().int().gt(0).lt(101),
});

const fixedAdvantage = z.object({
  [advantageType.enum.FIXED]: z.number().gt(0),
});

const advantage = z.union([percentageAdvantage, fixedAdvantage]);

export type Advantage = z.infer<typeof advantage>;

// TODO: add regex to check for illegal chars
const promocodeNameRefineErrorMessage =
  "A promocode name should be between 6 and 60 characters long";

function promocodeNameRefine(str: string) {
  return 5 < str.length && str.length < 61 && /^[a-zA-Z0-9]*$/.test(str);
}

export const CREATE_PROMOCODE_INPUT_SCHEMA = z.object({
  name: z.string().refine(promocodeNameRefine, {
    message: promocodeNameRefineErrorMessage,
  }),
  advantage,
  restrictions: z.array(restriction),
});

export type CreatePromocodeInputDTO = z.infer<
  typeof CREATE_PROMOCODE_INPUT_SCHEMA
>;

const location = z
  .object({
    city: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
  })
  .refine(
    ({ city, lat, lon }) => {
      if (city === undefined && lat === undefined && lon === undefined) {
        return false;
      }
      if (lat === undefined && lon !== undefined) {
        return false;
      }
      if (lat !== undefined && lon === undefined) {
        return false;
      }
      if (city !== undefined && (lat !== undefined || lon !== undefined)) {
        return false;
      }
      return true;
    },
    { message: "Please pass either a city, or a latitude and longitude" }
  );

const promocodeValidationArguments = z
  .object({
    age: z.number().int().optional(),
    location: location.optional(),
  })
  .optional();

export type PromocodeValidationArguments = z.infer<
  typeof promocodeValidationArguments
>;

export const VALIDATE_PROMOCODE_INPUT_SCHEMA = z.object({
  name: z
    .string()
    .refine(promocodeNameRefine, { message: promocodeNameRefineErrorMessage }),
  arguments: promocodeValidationArguments,
});

export type ValidatePromocodeInputDTO = z.infer<
  typeof VALIDATE_PROMOCODE_INPUT_SCHEMA
>;

export enum PromocodeStatus {
  ACCEPTED = "accepted",
  DENIED = "denied",
}

export interface ValidatePromocodeBaseDTO {
  promocode_name: string | undefined;
}

export type ValidatePromocodeSuccessDTO = ValidatePromocodeBaseDTO & {
  status: PromocodeStatus.ACCEPTED;
  advantage: Advantage;
};

export type ValidatePromocodeDeniedDTO = ValidatePromocodeBaseDTO & {
  status: PromocodeStatus.DENIED;
  errors: string[];
};

export const TOGGLE_ACTIVATION_INPUT_SCHEMA = z.object({
  name: z
    .string()
    .refine(promocodeNameRefine, { message: promocodeNameRefineErrorMessage }),
  active: z.boolean(),
});

export type ToggleActivationPromocodeInputDTO = z.infer<
  typeof TOGGLE_ACTIVATION_INPUT_SCHEMA
>;
