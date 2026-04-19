import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/* ─── Types matching backend exactly ─── */

export type MeasurementType = 'LengthUnit' | 'TemperatureUnit' | 'VolumeUnit' | 'WeightUnit';

export interface UnitOption {
  value: string;
  label: string;
}

export interface QuantityDTO {
  value: number;
  unitName: string;
  measurementType: string;
}

export interface RestResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ConvertRequest {
  value: number;
  unitName: string;
  measurementType: string;
  targetUnit: string;
}

export interface OperationRequest {
  firstQuantity: QuantityDTO;
  secondQuantity: QuantityDTO;
}

export interface HistoryRecord {
  id: number;
  thisValue: number;
  thisUnit: string;
  thisMeasurementType: string;
  thatValue: number | null;
  thatUnit: string | null;
  thatMeasurementType: string | null;
  operation: string;
  resultValue: number | null;
  resultUnit: string | null;
  resultMeasurementType: string | null;
  resultString: string | null;
  error: boolean;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  // private readonly API_URL = 'http://localhost:8080/api/quantities';
  // private readonly API_URL = 'http://3.108.135.101:8080/api/quantities';
  private readonly API_URL = '/api/quantities';

  constructor(private http: HttpClient) {}

  /* ─── Unit definitions matching backend strategies ─── */

  readonly unitsByType: Record<MeasurementType, UnitOption[]> = {
    LengthUnit: [
      { value: 'METER', label: 'Meter' },
      { value: 'CENTIMETER', label: 'Centimeter' },
      { value: 'KILOMETER', label: 'Kilometer' },
      { value: 'INCHES', label: 'Inches' },
      { value: 'FEET', label: 'Feet' },
      { value: 'YARD', label: 'Yard' },
      { value: 'MILE', label: 'Mile' },
    ],
    TemperatureUnit: [
      { value: 'CELSIUS', label: 'Celsius' },
      { value: 'FAHRENHEIT', label: 'Fahrenheit' },
      { value: 'KELVIN', label: 'Kelvin' },
    ],
    VolumeUnit: [
      { value: 'LITER', label: 'Liter' },
      { value: 'ML', label: 'Milliliter' },
      { value: 'GALLON', label: 'Gallon' },
    ],
    WeightUnit: [
      { value: 'KG', label: 'Kilogram' },
      { value: 'GRAM', label: 'Gram' },
      { value: 'POUND', label: 'Pound' },
      { value: 'OUNCE', label: 'Ounce' },
      { value: 'TONNE', label: 'Tonne' },
    ],
  };

  readonly typeLabels: Record<MeasurementType, string> = {
    LengthUnit: 'Length',
    TemperatureUnit: 'Temperature',
    VolumeUnit: 'Volume',
    WeightUnit: 'Weight',
  };

  /* ─── API calls ─── */

  convert(request: ConvertRequest): Observable<QuantityDTO> {
    return this.http
      .post<RestResponse<QuantityDTO>>(`${this.API_URL}/convert`, request)
      .pipe(map((res) => res.data));
  }

  add(request: OperationRequest): Observable<QuantityDTO> {
    return this.http
      .post<RestResponse<QuantityDTO>>(`${this.API_URL}/add`, request)
      .pipe(map((res) => res.data));
  }

  subtract(request: OperationRequest): Observable<QuantityDTO> {
    return this.http
      .post<RestResponse<QuantityDTO>>(`${this.API_URL}/subtract`, request)
      .pipe(map((res) => res.data));
  }

  multiply(request: OperationRequest): Observable<QuantityDTO> {
    return this.http
      .post<RestResponse<QuantityDTO>>(`${this.API_URL}/multiply`, request)
      .pipe(map((res) => res.data));
  }

  divide(request: OperationRequest): Observable<QuantityDTO> {
    return this.http
      .post<RestResponse<QuantityDTO>>(`${this.API_URL}/divide`, request)
      .pipe(map((res) => res.data));
  }

  compare(request: OperationRequest): Observable<boolean> {
    return this.http
      .post<RestResponse<boolean>>(`${this.API_URL}/compare`, request)
      .pipe(map((res) => res.data));
  }

  getHistory(): Observable<HistoryRecord[]> {
    return this.http
      .get<RestResponse<HistoryRecord[]>>(`${this.API_URL}/history`)
      .pipe(map((res) => res.data));
  }
}
