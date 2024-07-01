import { FastifyReply, FastifyRequest } from "fastify";
import { CreatePromocodeInputDTO } from "../domains/promocode.schema";
import { createPromocodeUseCase } from "../use-cases/createPromocode.usecase";
import { PromocodeRepository } from "../repositories/promocode.repository";

export function createPromocodeHandler(
  promocodeRepository: PromocodeRepository
) {
  return (
    request: FastifyRequest<{ Body: CreatePromocodeInputDTO }>,
    reply: FastifyReply
  ) => {
    const body = request.body;
    const promoCodeCreated = createPromocodeUseCase({
      promocodeRepository,
      promocodeToAdd: body,
    });

    if (!promoCodeCreated) {
      reply.code(500);
      reply.send({ success: false });
      return;
    }

    reply.code(201);
    reply.send({ success: true });
  };
}
