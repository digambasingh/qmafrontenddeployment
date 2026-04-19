import { Component, signal, OnInit } from '@angular/core';
import { ConversionService, HistoryRecord } from '../../services/conversion.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  records = signal<HistoryRecord[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  private typeIcons: Record<string, string> = {
    LengthUnit: '📏',
    TemperatureUnit: '🌡️',
    VolumeUnit: '🧪',
    WeightUnit: '⚖️',
  };

  constructor(private conversionService: ConversionService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.conversionService.getHistory().subscribe({
      next: (data) => {
        this.records.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to load history');
        this.isLoading.set(false);
      },
    });
  }

  getIcon(type: string): string {
    return this.typeIcons[type] ?? '📐';
  }

  formatOperation(op: string): string {
    if (!op) return '';
    return op.charAt(0).toUpperCase() + op.slice(1).toLowerCase();
  }

  formatType(type: string): string {
    if (!type) return '';
    return type.replace('Unit', '');
  }
}
