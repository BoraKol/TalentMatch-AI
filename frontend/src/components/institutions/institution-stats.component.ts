import { Component, Input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Institution } from '../../services/institution.service';

@Component({
    selector: 'app-institution-stats',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="text-slate-500 text-sm font-medium uppercase mb-1">Total Institutions</div>
        <div class="text-3xl font-black text-slate-800">{{ totalCount() }}</div>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="text-slate-500 text-sm font-medium uppercase mb-1">Active Status</div>
        <div class="text-3xl font-black text-emerald-600">
          {{ activeCount() }}
        </div>
      </div>
       <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div class="text-slate-500 text-sm font-medium uppercase mb-1">Pending Invites</div>
        <div class="text-3xl font-black text-amber-500">
           {{ pendingCount() }}
        </div>
      </div>
    </div>
  `
})
export class InstitutionStatsComponent {
    @Input({ required: true }) institutions!: Signal<Institution[]>;

    totalCount = computed(() => this.institutions().length);
    activeCount = computed(() => this.institutions().filter(i => i.status === 'active').length);
    pendingCount = computed(() => this.institutions().filter(i => i.status === 'pending').length);
}
