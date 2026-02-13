# 🚀 TalentMatch AI 

**TalentMatch AI** is a next-generation recruitment platform designed to modernize the hiring process. By leveraging Artificial Intelligence, it connects top talent with the right opportunities instantly, while providing recruiters with deep insights and automated tools to manage the pipeline efficiently.

---

## ✨ Key Features

### 🤖 AI-Powered Matching
- **Smart Scoring**: Automatically analyzes candidate profiles against job requirements.
- **Instant Ranking**: Presents the best fits at the top, saving recruiters hours of manual screening.
- **Detailed Analysis**: Provides AI-generated insights on *why* a candidate is a good match.

### 📊 Advanced Analytics Dashboard
- **Real-Time Metrics**: Track Total Candidates, Active Jobs, and System Users.
- **Skill Demand Analysis**: Visualize which skills are most prevalent in your talent pool.
- **Hiring Insights**: 
    - **Hires by Institution**: See which universities/sources yield the best hires.
    - **Top Employers**: Track which companies are hiring the most aggressively.

### 📧 Automated Communication
- **One-Click Invites**: Send professional interview invitations directly from the candidate profile.
- **Email Integration**: Integrated with `Nodemailer` for reliable delivery (Demo mode with Ethereal Email).

### 🎨 Modern & Responsive Design
- **Premium UI/UX**: Built with **Tailwind CSS** for a clean, professional, and mobile-responsive interface.
- **Interactive Charts**: Powered by **Chart.js** for beautiful data visualization.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 17+ (Signals, Standalone Components)
- **Styling**: Tailwind CSS
- **Visualization**: Chart.js / ng2-charts
- **HTTP Client**: RxJS

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Language**: TypeScript
- **Email**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Connection String

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talentmatch-ai.git
   cd talentmatch-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example (MONGODB_URI, etc.)
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **SMTP Configuration (Email)**
   - Create a `.env` file in the `backend` folder.
   - Add the following variables (example for Gmail):
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-specific-password
     ```
   - *Note: If not configured, emails will be simulated (logged to console).*

5. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) (or whichever port Vite/Angular assigns) in your browser.

---

## 🛡️ Architecture
The project follows a **Clean Architecture** principle to ensure scalability and maintainability:
- **Controllers**: Handle HTTP requests.
- **Services**: Business logic and data processing.
- **Repositories**: Database abstraction layer.
- **Models**: Mongoose schemas and type definitions.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
