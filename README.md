# EngineerVault - Engineering E-Library Platform

<p align="center">
  <img src="https://img.shields.io/badge/EngineerVault-v2.0.0-gold" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-16-blue" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-cyan" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

## 🚀 About EngineerVault

EngineerVault is a modern, AI-powered engineering eLibrary platform designed to help engineering students, researchers, and professionals discover, access, and manage engineering resources. Built with cutting-edge web technologies, it offers an immersive reading experience with gamification elements to encourage continuous learning.

## ✨ Key Features

### 📚 Library Management
- **Universal Book Search** - Search millions of engineering books from Open Library
- **Book Details with Tabs** - Overview, Description, and Details views
- **Personal Library Collection** - Curated collection of engineering books
- **Favorites System** - Save and organize your favorite books

### 🎮 Gamification System
- **Points & Rewards** - Earn points for reading, searching, and saving books
- **User Levels** - Progress through levels as you accumulate points
- **Achievements** - Unlock achievements for milestones
- **Badges** - Earn badges for various accomplishments
- **Day Streaks** - Maintain login streaks for bonus rewards
- **Leaderboard-ready** - Points system ready for community competition

### 📊 User Dashboard
- **Personal Stats** - Track books read, points earned, favorites saved
- **Level Progress** - Visual progress bar to next level
- **Library Card** - Unique library number for each user
- **Badge Collection** - View all earned and locked badges
- **Achievement Tracking** - Monitor progress toward achievements

### 🛒 Book Store
- **Point Redemption** - Redeem points for premium content
- **Course Bundles** - Access engineering courses
- **E-Books & Subscriptions** - Purchase premium resources

### 🎨 Modern UI/UX
- **Dark & Light Themes** - Toggle between themes
- **Responsive Design** - Works on all devices
- **Grid & List Views** - Choose your preferred display
- **Category Filtering** - Filter by engineering disciplines

### 🔐 Authentication
- **Email Authentication** - Secure login via Supabase
- **User Sessions** - Persistent user state

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 18** | UI library with hooks |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Supabase** | Authentication & backend |
| **Open Library API** | Book data source |
| **Lucide React** | Icons |

## 📁 Project Structure

```
E-library/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── EngineerVaultApp.tsx  # Main application
├── lib/                   # Utility libraries
│   ├── api.ts            # API utilities
│   ├── data.ts           # Static data
│   └── supabaseClient.ts # Supabase client
├── types/                 # TypeScript types
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📖 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🎯 Engineering Categories

- Mechanical Engineering
- Electrical & Electronics
- Mechatronics
- Robotics & Automation
- Embedded Systems
- Programming (C, C++, Python, MATLAB)
- CAD & Simulation
- Computer Science
- Civil Engineering
- Chemical Engineering
- Aerospace Engineering

## 🤝 Contributing

We welcome open source contributions! This project is designed for community involvement.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Contact

For questions or contributions, please reach out:

**Email:** nmesirionyengbaronye@gmail.com

---

<p align="center">Built with ❤️ for engineering students worldwide</p>
