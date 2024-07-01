import { PromocodeRepository } from "../repositories/promocode.repository";

export function toggleActivationPromocodeUseCase(params: {
  promocodeRepository: PromocodeRepository;
  promocodeName: string;
  active: boolean;
}): boolean {
  const { promocodeRepository, promocodeName, active } = params;

  return promocodeRepository.togglePromocodeActiveState(promocodeName, active);
}
