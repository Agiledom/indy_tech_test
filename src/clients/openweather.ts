import { WeatherObservation } from "../domains/promocode.schema";
import logger from "../framework/logger";

interface OpenWeatherApiResponse {
  main: {
    temp: number;
  };
  weather: { main: WeatherObservation }[];
}

export interface FetchOpenWeatherDataByCityReturn {
  weatherObservation: WeatherObservation;
  temperatureCelsius: number;
}

export type FetchOpenWeatherDataClient = (params?: {
  lat?: number;
  lon?: number;
  city?: string;
}) => Promise<FetchOpenWeatherDataByCityReturn>;

export async function fetchOpenWeatherData(params?: {
  lat?: number;
  lon?: number;
  city?: string;
}): Promise<FetchOpenWeatherDataByCityReturn> {
  const { lat, lon, city } = params ?? {};

  try {
    if (!process.env.OPEN_WEATHER_API_KEY) {
      throw new Error("[ERROR] Missing openweather api key");
    }

    if (lat == null && lon == null && city == null) {
      throw new Error("[ERROR] Missing lat and lon, or city in params");
    }

    const queryString =
      lat != null && lon != null ? `lat=${lat}&lon=${lon}` : `q=${city}`;
    const weatherData: OpenWeatherApiResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${queryString}&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`
    ).then((response) => response.json());

    const weatherObservation: WeatherObservation | undefined =
      weatherData.weather[0]?.main;

    if (weatherObservation == null) {
      throw new Error(
        "[ERROR] Unable to extract weather observation from Open Weatherv2.5 reponse"
      );
    }
    return {
      weatherObservation,
      temperatureCelsius: weatherData.main.temp,
    };
  } catch (e) {
    logger.error(e);
    throw new Error("[ERROR] Unable to fetch weather data");
  }
}
