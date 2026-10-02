# 💸 Bocor Halus — Gen Z Minimalist Expense Tracker

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000000?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-Clean-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)
[![SQLite](https://img.shields.io/badge/Storage-Expo_SQLite-003B57?logo=sqlite&logoColor=white)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![CI](https://github.com/andrew-sora/bocor-halus-app/actions/workflows/ci.yml/badge.svg)](https://github.com/andrew-sora/bocor-halus-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A Product Case Study in Empathy & Creative Technology for ParagonTech Selection.**  
> Built for young mothers, housewives, and remote workers struggling with untracked micro-expenses ("bocor halus"). Clean, Gen Z aesthetic, 100% offline, and zero financial complexity.

---

## 🎯 Problem Statement & Product Vision

### 🥊 The Problem
For everyday users—such as young mothers, housewives, and remote workers managing tight household or living budgets—existing personal finance apps suffer from 3 major flaws:
1. **Financial Anxiety & Complexity:** Overwhelmed by corporate charts, mandatory accounts, and multi-layered category forms.
2. **Untracked Micro-Leakages ("Bocor Halus"):** Small, repeated daily purchases (e.g. Rp 15.000 coffee, snacks, or market add-ons) go unrecorded because opening a separate calculator app to sum up receipts (`17.000 + 75.000`) creates high friction.
3. **Budget Blindness:** No immediate visual feedback on remaining monthly allowance ("Sisa Jatah Bulanan").

### ✨ The Solution: *Bocor Halus (Gen Z Edition)*
Designed with a **Clean, Soft & Modern Aesthetic** (Earth Tone Palette: Soft Warm Cream `#FAF7F2`, Deep Emerald `#064E3B`, and Soft Mint `#D1FAE5`) and 4 core empathy-driven features:

```
┌──────────────────────────────────────────────────────────┐
│                  Bocor Halus Dashboard                   │
├──────────────────────────────────────────────────────────┤
│  [Total Bulan Ini]  Rp 1.250.000                         │
│  [Sisa Jatah]       Rp 1.750.000 (42% Terpakai)         │
│  [Progress Bar]     ████████░░░░░░░░░░ (Status: Aman ✨) │
│                                                          │
│  💡 Insight: Bulan ini ada 8 transaksi kecil (< Rp 50k) │
│     senilai Rp 240.000. Sering tak terasa!               │
└──────────────────────────────────────────────────────────┘
```

#### 🌟 4 Core Empathy Pillars
1. **In-App Expression Evaluator (`17.000+75.000`):** Type complex receipts directly without leaving the app. Computed on-the-fly safely without `eval()`.
2. **Empathy Budget Limit Meter ("Sisa Jatah"):** Real-time visual progress bar indicating budget health (*Aman*, *Waspada*, *Overbudget*).
3. **1-Tap Emoji Tagging:** Instant category chips (`🛒 Dapur`, `🍼 Anak`, `☕ Jajan`, `⚡ Listrik`, `🛵 Transport`, `📦 Lainnya`).
4. **Bocor Halus Micro-Leakage Chip:** Smart highlight summarizing small purchases (< Rp 50.000) to build financial awareness.

---

## 🏗️ Technical Architecture & Key Engineering Highlights

```
bocor-halus-app/
├── app/                      # Expo Router (File-based navigation)
│   ├── (tabs)/               # Bottom Tab Navigator (Beranda, Rekap, Pengaturan)
│   │   ├── index.tsx         # Dashboard total & recent transaction stream
│   │   ├── rekap.tsx         # 12-month summary breakdown
│   │   └── pengaturan.tsx    # Budget limit configuration & local backup/restore
│   ├── rekap/[ym].tsx        # Monthly detail view (e.g. 2026-09)
│   └── tambah.tsx            # Expense modal (Category Chips + Operator Bar)
├── components/               # Specialized UI Components
│   ├── OperatorBar.tsx       # Custom math operator keyboard (+ − × ÷)
│   ├── TotalCard.tsx         # Empathy Budget & Micro-Insight Display
│   ├── ExpenseRow.tsx        # Category Tag Badges & Transaction Row
│   └── MoneyText.tsx         # Locale-aware Indonesian Rupiah formatter
├── lib/                      # Core Logic & Utilities
│   ├── evalExpr.ts           # Custom AST math expression tokenizer & parser (Zero-eval)
│   ├── db.ts                 # Database layer with parameter binding & micro-insight queries
│   ├── dbEngine.native.ts    # Native Expo SQLite engine (iOS/Android)
│   ├── dbEngine.web.ts       # Web LocalStorage fallback engine (Browser Preview)
│   ├── date.ts               # Local timezone date helpers (prevents UTC drift)
│   ├── format.ts             # Currency & display formatters
│   └── backup.ts             # JSON export/import backup engine
└── constants/                # UI strings & Gen Z aesthetic color tokens
```

### 💡 High-Rigor Engineering Practices
- **Safe Math Tokenizer & Parser (`lib/evalExpr.ts`):** Evaluates arithmetic string expressions safely using a recursive descent parser. Completely avoids JS `eval()` or `Function()` constructors.
- **Cross-Platform Engine Isolation (`dbEngine.native.ts` vs `dbEngine.web.ts`):** Employs Metro platform extensions so native SQLite runs on iOS/Android while a zero-dependency LocalStorage engine powers web previews smoothly.
- **Local Timezone Guard (`lib/date.ts`):** Standard `toISOString()` shifts dates in UTC+7 (Indonesia WIB) leading to wrong transaction dates for midnight records. Custom helpers ensure strict local date formatting (`YYYY-MM-DD`).
- **Automated CI Pipeline & Zero Lint Errors:** Enforced via GitHub Actions CI (`typecheck`, `eslint` clean with 0 errors, and 51 unit tests passed with 100% pass rate).

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Database** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (`openDatabaseAsync`) + LocalStorage Web Fallback |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) / React Native `StyleSheet` |
| **Date Picker** | `@react-native-community/datetimepicker` |
| **File I/O & Backup** | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| **Testing** | `jest-expo`, `@testing-library/react-native` |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/andrew-sora/bocor-halus-app.git
   cd bocor-halus-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run TypeScript check & Unit tests:**
   ```bash
   npm run typecheck
   npm run test
   ```

4. **Start local dev server (Web or Mobile):**
   ```bash
   npx expo start --web
   ```

---

## 📝 Technical Decisions & Architecture Log

All technical architecture decisions, library choices, and trade-offs are documented in [DECISIONS.md](DECISIONS.md).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

<p center>Crafted with Empathy & Precision by <strong>Andrew</strong> (Soradev Studio)</p>
