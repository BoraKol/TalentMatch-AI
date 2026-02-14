import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="text-center py-12 px-4 rounded-xl border-2 border-dashed"
         [class.bg-slate-50]="variant === 'default'"
         [class.border-slate-200]="variant === 'default'"
         [class.bg-white]="variant === 'card'"
         [class.border-slate-100]="variant === 'card'">
      
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
           [class.bg-slate-100]="!iconBgColor"
           [class]="iconBgColor"
           [style.background-color]="iconBgColor">
        <ng-content select="[icon]"></ng-content>
        <span *ngIf="!hasIcon" class="text-3xl">{{ iconEmoji }}</span>
      </div>

      <h3 class="text-lg font-semibold text-slate-800 mb-2">{{ title }}</h3>
      
      <p class="text-slate-500 max-w-sm mx-auto mb-6">
        {{ message }}
      </p>

      <div class="flex justify-center gap-3">
        <button *ngIf="actionLabel" 
                (click)="onAction()"
                class="px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm"
                [class.bg-emerald-600]="actionType === 'primary'"
                [class.text-white]="actionType === 'primary'"
                [class.hover:bg-emerald-700]="actionType === 'primary'"
                [class.bg-white]="actionType === 'secondary'"
                [class.text-slate-700]="actionType === 'secondary'"
                [class.border]="actionType === 'secondary'"
                [class.border-slate-300]="actionType === 'secondary'"
                [class.hover:bg-slate-50]="actionType === 'secondary'">
          {{ actionLabel }}
        </button>
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
    @Input() title = 'No items found';
    @Input() message = 'There are no items to display at this time.';
    @Input() iconEmoji = '📂';
    @Input() iconBgColor = '';
    @Input() variant: 'default' | 'card' = 'default';

    @Input() actionLabel = '';
    @Input() actionType: 'primary' | 'secondary' = 'primary';

    @Output() action = new EventEmitter<void>();

    hasIcon = false; // logic checks for projected content? actually difficult in Angular simply. 
    // Let's assume usage of emoji OR projected icon.

    onAction() {
        this.action.emit();
    }
}
