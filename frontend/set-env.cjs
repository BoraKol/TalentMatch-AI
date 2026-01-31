const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m"
};

const envPath = path.resolve(__dirname, '.env.local');
const targetPath = path.resolve(__dirname, 'src/config.ts');

console.log(`${colors.cyan}Example script: Syncing .env.local to src/config.ts${colors.reset}`);

let apiKey = '';
let apiUrl = 'http://localhost:3002/api';

// Try to read .env.local
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    
    for (const line of lines) {
        if (line.trim().startsWith('VITE_GEMINI_API_KEY=')) {
            apiKey = line.split('=')[1].trim().replace(/"/g, '').replace(/'/g, '');
        } else if (line.trim().startsWith('GEMINI_API_KEY=')) {
            apiKey = line.split('=')[1].trim().replace(/"/g, '').replace(/'/g, '');
        }
        
        if (line.trim().startsWith('VITE_API_URL=')) {
            apiUrl = line.split('=')[1].trim().replace(/"/g, '').replace(/'/g, '');
        }
    }
    }
} else {
    console.warn(`${colors.yellow}Warning: .env.local file not found at ${envPath} (This is normal in CI/CD)${colors.reset}`);
}

// Override/Fallback with System Environment Variables (Critical for Vercel)
if (process.env.VITE_GEMINI_API_KEY) apiKey = process.env.VITE_GEMINI_API_KEY;
if (process.env.GEMINI_API_KEY) apiKey = process.env.GEMINI_API_KEY;
if (process.env.VITE_API_URL) apiUrl = process.env.VITE_API_URL;

console.log('Resolved API URL:', apiUrl);
console.log('Resolved API Key length:', apiKey ? apiKey.length : 0);


if (!apiKey) {
    console.error(`${colors.red}Error: GEMINI_API_KEY or VITE_GEMINI_API_KEY not found in .env.local${colors.reset}`);
} else {
    console.log(`${colors.green}Success: Found API Key${colors.reset}`);
}

const envConfigFile = `// This file is auto-generated from .env.local by set-env.js
export const config = {
    production: false,
    apiUrl: '${apiUrl}',
    geminiApiKey: '${apiKey}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`${colors.green}Success: src/config.ts generated correctly.${colors.reset}`);
