import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-white p-6 sm:p-12">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div class="absolute top-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[100px] rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <!-- Text Content -->
      <div class="relative z-10 text-center max-w-lg mb-8 md:mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          AI-Powered Recruitment
        </h2>
        <p class="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed px-4 md:px-0">
          Our intelligent agents analyze 80% of the hidden job market to connect the right talent with the right opportunity instantly.
        </p>
      </div>

      <!-- Diagram -->
      <div class="relative z-10 w-full max-w-[280px] sm:max-w-[360px] md:max-w-[480px] aspect-square">
        <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-2xl">
          <!-- Definitions -->
          <defs>
            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
            </marker>
            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4ADE80" />
            </marker>
             <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#A78BFA" />
            </marker>
             <linearGradient id="core-glow" x1="300" y1="200" x2="300" y2="400" gradientUnits="userSpaceOnUse">
                <stop stop-color="#3B82F6" />
                <stop offset="1" stop-color="#6366F1" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          </defs>

          <!-- Connecting Lines (Background) -->
          <!-- Institution to Core -->
          <path d="M300 480 L300 360" stroke="#A78BFA" stroke-width="2" stroke-dasharray="8 4" class="animate-dash-flow opacity-50" />
           <!-- Candidate to Core -->
          <path d="M150 150 L260 260" stroke="#4ADE80" stroke-width="2" stroke-dasharray="8 4" class="animate-dash-flow opacity-50" />
           <!-- Employer to Core -->
          <path d="M450 150 L340 260" stroke="#60A5FA" stroke-width="2" stroke-dasharray="8 4" class="animate-dash-flow opacity-50" />


          <!-- AI Core (Center) -->
          <g class="animate-float">
             <circle cx="300" cy="300" r="60" fill="url(#core-glow)" filter="url(#glow)" class="opacity-90 animate-pulse-core" />
             <!-- Circuit Details inside Core -->
             <path d="M280 300 H320 M300 280 V320" stroke="white" stroke-width="2" stroke-linecap="round" class="opacity-80" />
             <circle cx="300" cy="300" r="40" stroke="white" stroke-width="1.5" fill="none" stroke-dasharray="10 5" class="animate-spin-slow opacity-60" />
             <text x="300" y="350" text-anchor="middle" fill="white" font-size="12" font-family="monospace" class="opacity-80">AI ENGINE</text>
          </g>

          <!-- Candidate Node (Top Left) -->
          <g class="animate-float delay-700">
            <circle cx="150" cy="150" r="40" fill="#1E293B" stroke="#4ADE80" stroke-width="2" />
            <path d="M150 140 C150 135 154 135 154 135" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>
            <!-- User Icon -->
            <path d="M150 135 a15 15 0 0 1 15 15 v5 a20 20 0 0 1 -30 0 v-5 a15 15 0 0 1 15 -15 z" fill="#4ADE80" class="opacity-80"/>
            <text x="150" y="210" text-anchor="middle" fill="#94A3B8" font-size="14" font-weight="bold">Candidate</text>
          </g>

          <!-- Employer Node (Top Right) -->
          <g class="animate-float delay-1000">
            <circle cx="450" cy="150" r="40" fill="#1E293B" stroke="#60A5FA" stroke-width="2" />
             <!-- Briefcase Icon -->
            <rect x="435" y="135" width="30" height="24" rx="2" stroke="#60A5FA" stroke-width="2" fill="none" />
            <path d="M442 135 V130 A8 8 0 0 1 458 130 V135" stroke="#60A5FA" stroke-width="2" fill="none"/>
            <text x="450" y="210" text-anchor="middle" fill="#94A3B8" font-size="14" font-weight="bold">Employer</text>
          </g>

          <!-- Institution Node (Bottom) -->
          <g class="animate-float delay-500">
            <circle cx="300" cy="480" r="40" fill="#1E293B" stroke="#A78BFA" stroke-width="2" />
             <!-- Building Icon -->
            <path d="M285 495 H315 V465 H285 Z" stroke="#A78BFA" stroke-width="2" fill="none" />
            <path d="M290 495 V480 M300 495 V480 M310 495 V480" stroke="#A78BFA" stroke-width="1" />
            <text x="300" y="540" text-anchor="middle" fill="#94A3B8" font-size="14" font-weight="bold">Institution</text>
             <text x="300" y="555" text-anchor="middle" fill="#64748B" font-size="10">(Referral Source)</text>
          </g>

          <!-- Particles Flowing TO Core (Data Ingestion) -->
          <circle r="4" fill="#4ADE80">
            <animateMotion repeatCount="indefinite" dur="2s" path="M150 150 L260 260" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
             <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
          </circle>
           <circle r="4" fill="#60A5FA">
            <animateMotion repeatCount="indefinite" dur="2.5s" path="M450 150 L340 260" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
             <animate attributeName="opacity" values="1;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
           <circle r="4" fill="#A78BFA">
            <animateMotion repeatCount="indefinite" dur="3s" path="M300 480 L300 360" keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
             <animate attributeName="opacity" values="1;0" dur="3s" repeatCount="indefinite" />
          </circle>

          <!-- Success Connections (Result) appearing after processing -->
          <!-- Core to Candidate -->
           <path d="M260 260 L180 180" stroke="#4ADE80" stroke-width="3" marker-end="url(#arrowhead-green)" class="animate-path-reveal delay-500" stroke-dasharray="200" stroke-dashoffset="200"/>
           <!-- Core to Employer -->
           <path d="M340 260 L420 180" stroke="#60A5FA" stroke-width="3" marker-end="url(#arrowhead-blue)" class="animate-path-reveal delay-1000" stroke-dasharray="200" stroke-dashoffset="200"/>
        
        </svg>
      </div>
    
      <!-- Footer Branding -->
      <div class="absolute bottom-6 text-slate-500 text-xs">
        TalentMatch Intelligence System v2.0
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse-slow {
      animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .animate-spin-slow {
        animation: spin 10s linear infinite;
    }
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
    .animate-path-reveal {
        animation: dash 2s ease-out infinite alternate;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
    }
    @keyframes dash {
        0% { stroke-dashoffset: 200; opacity: 0.2; }
        50% { stroke-dashoffset: 0; opacity: 1; }
        100% { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes pulse-core {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.05); opacity: 1; filter: brightness(1.2); }
    }
    .animate-pulse-core {
        transform-origin: center;
        animation: pulse-core 3s ease-in-out infinite;
    }
  `]
})
export class LoginHeroComponent { }
