import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
             (click)="cancel()"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all animate-scale-up overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ title() }}
            </h3>
          </div>

          <!-- Body -->
          <div class="p-6">
            <p class="text-slate-600 text-lg leading-relaxed">{{ message() }}</p>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
            <button (click)="cancel()" 
                    class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 focus:ring-4 focus:ring-slate-100 transition-all">
              {{ cancelText() }}
            </button>
            <button (click)="confirm()" 
                    class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold hover:from-red-600 hover:to-pink-700 shadow-lg shadow-red-500/30 focus:ring-4 focus:ring-red-200 transition-all flex items-center gap-2">
              <span>{{ confirmText() }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    @keyframes scale-up {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scale-up 0.2s ease-out forwards;
    }
  `]
})
export class ConfirmationModalComponent {
    isOpen = signal(false);
    title = signal('Confirm Delete');
    message = signal('Are you sure you want to perform this action?');
    confirmText = signal('Delete');
    cancelText = signal('Cancel');

    private resolveRef: ((value: boolean) => void) | null = null;

    open(options: {
        title?: string,
        message: string,
        confirmText?: string,
        cancelText?: string
    }): Promise<boolean> {
        this.title.set(options.title || 'Confirm Delete');
        this.message.set(options.message);
        this.confirmText.set(options.confirmText || 'Delete');
        this.cancelText.set(options.cancelText || 'Cancel');

        this.isOpen.set(true);

        return new Promise((resolve) => {
            this.resolveRef = resolve;
        });
    }

    confirm() {
        this.isOpen.set(false);
        this.resolveRef?.(true);
        this.resolveRef = null;
    }

    cancel() {
        this.isOpen.set(false);
        this.resolveRef?.(false);
        this.resolveRef = null;
    }
}
