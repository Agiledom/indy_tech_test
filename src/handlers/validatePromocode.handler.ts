import { FastifyReply, FastifyRequest } from "fastify";
import {
  PromocodeStatus,
  ValidatePromocodeInputDTO,
} from "../domains/promocode.schema";
import { PromocodeRepository } from "../repositories/promocode.repository";
import { validatePromocodeUseCase } from "../use-cases/validatePromocode.usecase";
import { fetchOpenWeatherData } from "../clients/openweather";

export function validatePromocodeHandler(
  promocodeRepository: PromocodeRepository
) {
  return async (
    request: FastifyRequest<{ Body: ValidatePromocodeInputDTO }>,
    reply: FastifyReply
  ) => {
    const body = request.body;
    const validationResult = await validatePromocodeUseCase({
      promocodeRepository,
      promocodeToValidate: body.name,
      promocodeValidationArguments: body.arguments,
      fetchOpenWeatherData,
    });

    if (validationResult.status === PromocodeStatus.DENIED) {
      reply.code(403);
      reply.send(validationResult);
      return;
    }

    reply.code(200);
    reply.send(validationResult);
  };
}
