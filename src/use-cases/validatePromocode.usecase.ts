import {
  PromocodeStatus,
  PromocodeValidationArguments,
  ValidatePromocodeDeniedDTO,
  ValidatePromocodeSuccessDTO,
} from "../domains/promocode.schema";
import logger from "../framework/logger";
import { FetchOpenWeatherDataClient } from "../clients/openweather";
import { PromocodeRepository } from "../repositories/promocode.repository";
import { validatePromocode } from "./validatePromocode.logic";

export async function validatePromocodeUseCase(params: {
  promocodeRepository: PromocodeRepository;
  promocodeToValidate: string;
  promocodeValidationArguments: PromocodeValidationArguments;
  fetchOpenWeatherData: FetchOpenWeatherDataClient;
}): Promise<ValidatePromocodeSuccessDTO | ValidatePromocodeDeniedDTO> {
  const {
    promocodeRepository,
    promocodeToValidate,
    promocodeValidationArguments,
    fetchOpenWeatherData,
  } = params;

  const promocode = promocodeRepository.get(promocodeToValidate);

  if (!promocode) {
    logger.error("[ERROR]: Promocode not found");
    return {
      promocode_name: undefined,
      status: PromocodeStatus.DENIED,
      errors: ["Invalid Promocode"],
    };
  }

  if (!promocode.active) {
    return {
      promocode_name: undefined,
      status: PromocodeStatus.DENIED,
      errors: ["Invalid Promocode"],
    };
  }

  if (
    promocode.containsWeatherRestriction &&
    !promocodeValidationArguments?.location
  ) {
    return {
      promocode_name: promocode.name,
      status: PromocodeStatus.DENIED,
      errors: [
        "Missing the location details needed to validate this promocode",
      ],
    };
  }

  if (
    promocode.containsWeatherRestriction &&
    promocodeValidationArguments?.location
  ) {
    const weatherData = await fetchOpenWeatherData(
      promocodeValidationArguments?.location
    );

    const { isValid, errors } = validatePromocode(
      promocode,
      promocodeValidationArguments,
      weatherData
    );

    return isValid
      ? {
          promocode_name: promocode.name,
          status: PromocodeStatus.ACCEPTED,
          advantage: promocode.advantage,
        }
      : {
          promocode_name: promocode.name,
          status: PromocodeStatus.DENIED,
          errors,
        };
  }

  const { isValid, errors } = validatePromocode(
    promocode,
    promocodeValidationArguments
  );

  return isValid
    ? {
        promocode_name: promocode.name,
        status: PromocodeStatus.ACCEPTED,
        advantage: promocode.advantage,
      }
    : {
        promocode_name: promocode.name,
        status: PromocodeStatus.DENIED,
        errors,
      };
}
