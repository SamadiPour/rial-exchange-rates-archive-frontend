import axios from 'axios';
import {ExchangeRatesData} from '../types/exchange.ts';
import {parseDate} from "../utils/utils.ts";

const API_URL = 'https://raw.githubusercontent.com/SamadiPour/rial-exchange-rates-archive/refs/heads/data/gregorian_all.min.json';

export async function fetchExchangeRates(): Promise<ExchangeRatesData> {
  const response = await axios.get<ExchangeRatesData>(API_URL);
  return response.data;
}

export function getDateRange(data: ExchangeRatesData): { start: Date; end: Date } {
  const dates = Object.keys(data).sort();
  return {
    start: parseDate(dates[0]),
    end: parseDate(dates[dates.length - 1])
  };
}