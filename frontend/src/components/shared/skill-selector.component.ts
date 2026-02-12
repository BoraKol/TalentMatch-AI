import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SKILLS, Skill } from '../../config/skills.config';

@Component({
    selector: 'app-skill-selector',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" (click)="onClose()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="text-lg font-bold text-slate-800">
                    Select {{ categoryTitle }}
                </h3>
                <button (click)="onClose()" class="text-slate-400 hover:text-slate-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            
            <!-- Search & Filter -->
            <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div class="mb-4 relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <input type="text" 
                           [(ngModel)]="searchQuery" 
                           (input)="filterSkills()" 
                           placeholder="Search skills..." 
                           class="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 py-3 px-4 pl-10 transition-all">
                </div>

                <!-- Skill Grid -->
                <div class="grid grid-cols-2 gap-2">
                    <button *ngFor="let skill of filteredSkills" 
                            (click)="toggleSkill(skill.name)"
                            [class.bg-blue-50]="isSelected(skill.name)"
                            [class.border-blue-200]="isSelected(skill.name)"
                            [class.text-blue-700]="isSelected(skill.name)"
                            class="text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between group">
                        <span class="font-medium truncate">{{ skill.name }}</span>
                        <span *ngIf="isSelected(skill.name)" class="text-blue-600">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </span>
                    </button>
                </div>
                
                <!-- Empty State -->
                <div *ngIf="filteredSkills.length === 0" class="text-center py-8 text-slate-500">
                    No skills found fitting your search.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                 <button (click)="onClose()" class="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors">
                    Done
                </button>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
  `]
})
export class SkillSelectorComponent implements OnInit, OnChanges {
    @Input() categoryTitle: string = 'Skills';
    @Input() selectedSkills: string[] = [];
    @Input() skillType: 'technical' | 'soft' | 'all' = 'all';
    @Output() skillToggled = new EventEmitter<string>();
    @Output() close = new EventEmitter<void>();

    searchQuery: string = '';
    availableSkills: Skill[] = DEFAULT_SKILLS;
    filteredSkills: Skill[] = [];

    ngOnInit() {
        this.filterSkills();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['skillType']) {
            this.filterBySkillType();
        }
    }

    filterBySkillType() {
        if (this.skillType === 'all') {
            this.availableSkills = DEFAULT_SKILLS;
        } else {
            this.availableSkills = DEFAULT_SKILLS.filter(s => s.skillType === this.skillType);
        }
        this.filterSkills();
    }

    filterSkills() {
        const query = this.searchQuery.toLowerCase().trim();
        let source = DEFAULT_SKILLS;

        if (this.skillType !== 'all') {
            source = source.filter(s => s.skillType === this.skillType);
        }

        if (!query) {
            this.filteredSkills = source;
        } else {
            this.filteredSkills = source.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query)
            );
        }
    }

    isSelected(skillName: string): boolean {
        return this.selectedSkills.includes(skillName);
    }

    toggleSkill(skillName: string) {
        this.skillToggled.emit(skillName);
    }

    onClose() {
        this.close.emit();
    }
}
