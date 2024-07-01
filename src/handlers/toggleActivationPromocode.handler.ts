import { FastifyReply, FastifyRequest } from "fastify";
import { toggleActivationPromocodeUseCase } from "../use-cases/toggleActivationPromocode.usecase";
import { ToggleActivationPromocodeInputDTO } from "../domains/promocode.schema";
import { PromocodeRepository } from "../repositories/promocode.repository";

export function toggleActivationPromocodeHandler(
  promocodeRepository: PromocodeRepository
) {
  return (
    request: FastifyRequest<{ Body: ToggleActivationPromocodeInputDTO }>,
    reply: FastifyReply
  ) => {
    const body = request.body;
    const promoCodeToggled = toggleActivationPromocodeUseCase({
      promocodeRepository,
      promocodeName: body.name,
      active: body.active,
    });

    if (!promoCodeToggled) {
      reply.code(500);
      reply.send({ success: false });
      return;
    }

    reply.code(200);
    reply.send({ success: true });
  };
}
