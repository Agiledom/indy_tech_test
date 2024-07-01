import { FastifyInstance } from "fastify";
import buildServer from "./server";
import { WeatherObservation } from "./domains/promocode.schema";

let server: FastifyInstance;

beforeEach(async () => {
  server = buildServer();
  await server.ready();
});

afterEach(async () => {
  await server.close();
});

describe("POST /promocode", () => {
  it("should refuse because of an invalid input with missing required keys", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: { code: "1234", discount: 10 },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(400);
      }
    );
  });

  it("should refuse because of an invalid restriction", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TESTPROMOCODE",
          advantage: { percent: 20 },
          restrictions: [{ nonValidRestrictionKey: { eq: 40 } }],
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(400);
      }
    );
  });

  it("should refuse because of an invalid promocode name", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TESTPROMOCO!&",
          advantage: { percent: 20 },
          restrictions: [],
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(400);
      }
    );
  });

  it("should create promocode despite unknown keys", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TEST10",
          advantage: { percent: 20, unknownKey: "unknownValue" },
          restrictions: [],
          unknownKey: "unknownValue",
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(201);
      }
    );
  });

  it("should create a promocode with nested restrictions", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TEST10",
          advantage: { percent: 20 },
          restrictions: [
            {
              date: {
                before: "2022-01-01",
                after: "2021-01-01",
              },
            },
            {
              or: [
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
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(201);
      }
    );
  });
});

describe("POST /promocode/validate", () => {
  it("should refuse because of there not being a promocode", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode/validate",
        payload: { name: "TESTPROMOCODE" },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(403);
        const body = JSON.parse(response?.body as string);
        expect(body?.promocode_name).toBe(undefined);
      }
    );
  });

  it("should successfully validate a promocode", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TESTPROMOCODE",
          advantage: { percent: 20 },
          restrictions: [{ age: { eq: 40 } }],
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(201);
      }
    );
    server.inject(
      {
        method: "POST",
        url: "/promocode/validate",
        payload: { name: "TESTPROMOCODE", arguments: { age: 40 } },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(200);
        const body = JSON.parse(response?.body as string);
        expect(body?.promocode_name).toBe("TESTPROMOCODE");
        expect(body?.advantage).toEqual({ percent: 20 });
      }
    );

    server.inject(
      {
        method: "POST",
        url: "/promocode/validate",
        payload: { name: "TESTPROMOCODE", arguments: { age: 41 } },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(403);
        const body = JSON.parse(response?.body as string);
        expect(body?.promocode_name).toBe("TESTPROMOCODE");
        expect(body?.errors).toEqual([
          "Age: Value must be equal to 40, received 41",
        ]);
      }
    );
  });
});

describe("PUT /promocode/toggle-activation", () => {
  it("should successfully toggle the activation of a promocode", () => {
    server.inject(
      {
        method: "POST",
        url: "/promocode",
        payload: {
          name: "TEST10",
          advantage: { percent: 20 },
          restrictions: [],
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(201);
      }
    );

    server.inject(
      {
        method: "PUT",
        url: "/promocode/toggle-activation",
        payload: {
          name: "TEST10",
          active: false,
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(200);
      }
    );
  });

  it("should gracefully handle when a promocode doesnn't exist", () => {
    server.inject(
      {
        method: "PUT",
        url: "/promocode/toggle-activation",
        payload: {
          name: "TEST10",
          active: false,
        },
      },
      (err, response) => {
        expect(response?.statusCode).toBe(500);
        const body = JSON.parse(response?.body as string);
        expect(body?.success).toBe(false);
      }
    );
  });
});
