import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-detail-diet-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-detail-diet-chart.html',
  styleUrl: './member-detail-diet-chart.scss',
})
export class PTMemberDetailDietChartComponent {
  @Input() activeDiet: any = null;
  @Output() openAssignModal = new EventEmitter<void>();

  onOpenAssignModal(): void {
    this.openAssignModal.emit();
  }

  getMacroPercentage(macroType: 'protein' | 'carbs' | 'fats'): number {
    if (!this.activeDiet || !this.activeDiet.macros) return 0;
    const protein = this.activeDiet.macros.protein || 0;
    const carbs = this.activeDiet.macros.carbs || 0;
    const fats = this.activeDiet.macros.fats || 0;

    const pKcal = protein * 4;
    const cKcal = carbs * 4;
    const fKcal = fats * 9;
    const totalKcal = pKcal + cKcal + fKcal;

    if (totalKcal === 0) return 0;

    if (macroType === 'protein') return Math.round((pKcal / totalKcal) * 100);
    if (macroType === 'carbs') return Math.round((cKcal / totalKcal) * 100);
    return Math.round((fKcal / totalKcal) * 100);
  }

  getCircumference(): number {
    return 377; // 2 * Math.PI * 60
  }

  getProteinOffset(): number {
    const pct = this.getMacroPercentage('protein');
    return this.getCircumference() - (pct / 100) * this.getCircumference();
  }

  getCarbsOffset(): number {
    const pct = this.getMacroPercentage('carbs');
    const proteinPct = this.getMacroPercentage('protein');
    return this.getCircumference() - ((pct + proteinPct) / 100) * this.getCircumference();
  }

  getFatsOffset(): number {
    const pct = this.getMacroPercentage('fats');
    const prevPct = this.getMacroPercentage('protein') + this.getMacroPercentage('carbs');
    return this.getCircumference() - ((pct + prevPct) / 100) * this.getCircumference();
  }
}
