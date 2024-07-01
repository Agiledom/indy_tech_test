import fastify, { FastifyBaseLogger } from "fastify";
import logger from "./framework/logger";
import "dotenv/config";
import { createPromocodeHandler } from "./handlers/createPromocode.handler";
import { validatePromocodeHandler } from "./handlers/validatePromocode.handler";
import { toggleActivationPromocodeHandler } from "./handlers/toggleActivationPromocode.handler";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import {
  CREATE_PROMOCODE_INPUT_SCHEMA,
  TOGGLE_ACTIVATION_INPUT_SCHEMA,
  VALIDATE_PROMOCODE_INPUT_SCHEMA,
} from "./domains/promocode.schema";
import { PromocodeRepository } from "./repositories/promocode.repository";

export default function buildServer() {
  const server = fastify({ logger: logger as FastifyBaseLogger });

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  const promocodeRepository = new PromocodeRepository();

  server.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/promocode",
    schema: { body: CREATE_PROMOCODE_INPUT_SCHEMA },
    handler: createPromocodeHandler(promocodeRepository),
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/promocode/validate",
    schema: { body: VALIDATE_PROMOCODE_INPUT_SCHEMA },
    handler: validatePromocodeHandler(promocodeRepository),
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/promocode/toggle-activation",
    schema: { body: TOGGLE_ACTIVATION_INPUT_SCHEMA },
    handler: toggleActivationPromocodeHandler(promocodeRepository),
  });

  return server;
}
