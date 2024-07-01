import {
  CreatePromocodeInputDTO,
  Restriction,
  RestrictionType,
} from "../domains/promocode.schema";
import { PromocodeRepository } from "../repositories/promocode.repository";
import {
  isAndRestriction,
  isOrRestriction,
  isWeatherRestriction,
} from "./validatePromocode.logic";

function doesContainWeatherRestriction(restriction: Restriction): boolean {
  if (isWeatherRestriction(restriction)) {
    return true;
  }

  if (isAndRestriction(restriction)) {
    return restriction[RestrictionType.AND].some((restriction) =>
      doesContainWeatherRestriction(restriction)
    );
  }

  if (isOrRestriction(restriction)) {
    return restriction[RestrictionType.OR].some((restriction) =>
      doesContainWeatherRestriction(restriction)
    );
  }

  return false;
}

export function createPromocodeUseCase(params: {
  promocodeRepository: PromocodeRepository;
  promocodeToAdd: CreatePromocodeInputDTO;
}): boolean {
  const { promocodeRepository, promocodeToAdd } = params;

  const containsWeatherRestriction = promocodeToAdd.restrictions.some(
    (restriction) => doesContainWeatherRestriction(restriction)
  );

  return promocodeRepository.saveNewPromocode(promocodeToAdd.name, {
    ...promocodeToAdd,
    active: true,
    containsWeatherRestriction,
  });
}
