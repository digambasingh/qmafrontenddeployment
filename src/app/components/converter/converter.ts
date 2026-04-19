import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ConversionService,
  MeasurementType,
  UnitOption,
} from '../../services/conversion.service';

export type OperationType = 'convert' | 'add' | 'subtract' | 'multiply' | 'divide' | 'compare';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './converter.html',
  styleUrl: './converter.css',
})
export class Converter {
  readonly measurementTypes: { type: MeasurementType; label: string; icon: string }[] = [
    { type: 'LengthUnit', label: 'Length', icon: '📏' },
    { type: 'TemperatureUnit', label: 'Temperature', icon: '🌡️' },
    { type: 'VolumeUnit', label: 'Volume', icon: '🧪' },
    { type: 'WeightUnit', label: 'Weight', icon: '⚖️' },
  ];

  readonly operations: { type: OperationType; label: string; icon: string }[] = [
    { type: 'convert', label: 'Convert', icon: '🔄' },
    { type: 'add', label: 'Add', icon: '➕' },
    { type: 'subtract', label: 'Subtract', icon: '➖' },
    { type: 'multiply', label: 'Multiply', icon: '✖️' },
    { type: 'divide', label: 'Divide', icon: '➗' },
    { type: 'compare', label: 'Compare', icon: '🔍' },
  ];

  selectedType = signal<MeasurementType>('LengthUnit');
  selectedOperation = signal<OperationType>('convert');

  fromValue = signal<number>(1);
  fromUnit = signal<string>('METER');

  secondValue = signal<number>(1);
  secondUnit = signal<string>('CENTIMETER');

  toUnit = signal<string>('CENTIMETER');

  resultValue = signal<string>('');
  resultUnit = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  availableUnits = computed<UnitOption[]>(() => {
    return this.conversionService.unitsByType[this.selectedType()];
  });

  get isConvert(): boolean {
    return this.selectedOperation() === 'convert';
  }

  get isCompare(): boolean {
    return this.selectedOperation() === 'compare';
  }

  constructor(private conversionService: ConversionService) {}

  selectType(type: MeasurementType): void {
    this.selectedType.set(type);
    const units = this.conversionService.unitsByType[type];
    this.fromUnit.set(units[0].value);
    this.secondUnit.set(units[1]?.value ?? units[0].value);
    this.toUnit.set(units[1]?.value ?? units[0].value);
    this.fromValue.set(1);
    this.secondValue.set(1);
    this.clearResult();
  }

  selectOperation(op: OperationType): void {
    this.selectedOperation.set(op);
    this.clearResult();
  }

  onFromValueChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fromValue.set(parseFloat(input.value) || 0);
  }

  onSecondValueChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.secondValue.set(parseFloat(input.value) || 0);
  }

  onFromUnitChange(event: Event): void {
    this.fromUnit.set((event.target as HTMLSelectElement).value);
  }

  onSecondUnitChange(event: Event): void {
    this.secondUnit.set((event.target as HTMLSelectElement).value);
  }

  onToUnitChange(event: Event): void {
    this.toUnit.set((event.target as HTMLSelectElement).value);
  }

  swapUnits(): void {
    if (this.isConvert) {
      const temp = this.fromUnit();
      this.fromUnit.set(this.toUnit());
      this.toUnit.set(temp);
    } else {
      const tempVal = this.fromValue();
      const tempUnit = this.fromUnit();
      this.fromValue.set(this.secondValue());
      this.fromUnit.set(this.secondUnit());
      this.secondValue.set(tempVal);
      this.secondUnit.set(tempUnit);
    }
  }

  calculate(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.resultValue.set('');
    this.resultUnit.set('');

    const type = this.selectedType();
    const op = this.selectedOperation();

    if (op === 'convert') {
      this.conversionService
        .convert({
          value: this.fromValue(),
          unitName: this.fromUnit(),
          measurementType: type,
          targetUnit: this.toUnit(),
        })
        .subscribe({
          next: (result) => {
            this.resultValue.set(parseFloat(result.value.toFixed(6)).toString());
            this.resultUnit.set(result.unitName);
            this.isLoading.set(false);
          },
          error: (err) => this.handleError(err, 'Conversion failed'),
        });
    } else if (op === 'compare') {
      const request = this.buildOperationRequest(type);
      this.conversionService.compare(request).subscribe({
        next: (result) => {
          this.resultValue.set(result ? '✅ Equal' : '❌ Not Equal');
          this.resultUnit.set('');
          this.isLoading.set(false);
        },
        error: (err) => this.handleError(err, 'Comparison failed'),
      });
    } else {
      const request = this.buildOperationRequest(type);
      const apiCall =
        op === 'add'
          ? this.conversionService.add(request)
          : op === 'subtract'
            ? this.conversionService.subtract(request)
            : op === 'multiply'
              ? this.conversionService.multiply(request)
              : this.conversionService.divide(request);

      apiCall.subscribe({
        next: (result) => {
          this.resultValue.set(parseFloat(result.value.toFixed(6)).toString());
          this.resultUnit.set(result.unitName);
          this.isLoading.set(false);
        },
        error: (err) => this.handleError(err, 'Operation failed'),
      });
    }
  }

  private buildOperationRequest(type: MeasurementType) {
    return {
      firstQuantity: {
        value: this.fromValue(),
        unitName: this.fromUnit(),
        measurementType: type,
      },
      secondQuantity: {
        value: this.secondValue(),
        unitName: this.secondUnit(),
        measurementType: type,
      },
    };
  }

  private handleError(err: any, fallback: string): void {
    this.errorMessage.set(err?.error?.message ?? fallback);
    this.isLoading.set(false);
  }

  private clearResult(): void {
    this.resultValue.set('');
    this.resultUnit.set('');
    this.errorMessage.set('');
  }
}
