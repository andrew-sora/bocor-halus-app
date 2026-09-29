# 💸 Bocor Halus — Minimalist Expense Tracker

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000000?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/Storage-Expo_SQLite-003B57?logo=sqlite&logoColor=white)](https://docs.expo.dev/versions/latest/sdk/sqlite/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A User-Centric Mobile Expense Tracking Solution for Daily Micro-Expenses.**  
> Built with React Native & Expo SDK 57, tailored specifically for effortless daily record-keeping without financial complexity or chart fatigue.

---

## 🎯 Case Study & Product Vision

### The Problem
Most personal finance applications overload non-technical users with charts, mandatory categorization, cloud synchronization, and login paywalls. For everyday users—such as teachers or remote workers managing tight daily budgets—opening a separate calculator app to sum up daily market receipts (`17.000 + 75.000`) introduces unnecessary friction.

### The Solution: *Bocor Halus*
*Bocor Halus* (Indonesian for "minor hidden financial leaks") focuses on **frictionless micro-entry**, **100% offline data privacy**, and **instant mathematical evaluation**.

#### Core Design Pillars
1. **Inline Math Expression Evaluation:** Input values directly using expression syntax like `17.000+75.000` or `3*15000`. Evaluated safely on-the-fly without dangerous `eval()` or external libraries.
2. **12-Month Clean Audit Trail:** Tabular monthly recap of all expenses without overwhelming graphs or multi-currency setup.
3. **100% Offline & Local Privacy:** Powered by `expo-sqlite` with zero tracking, zero external network requests, and zero cloud dependency.
4. **Platform-Agnostic Excellence:** Runs seamlessly on both Android & iOS using modern React Native Expo Router architecture.

---

## 🏗️ Technical Architecture & Key Engineering Highlights

```
bocor-halus-app/
├── app/                      # Expo Router (File-based navigation)
│   ├── (tabs)/               # Bottom Tab Navigator (Beranda, Rekap, Pengaturan)
│   │   ├── index.tsx         # Dashboard total & recent transaction stream
│   │   ├── rekap.tsx         # 12-month summary breakdown
│   │   └── pengaturan.tsx    # Local database backup/restore & app details
│   ├── rekap/[ym].tsx        # Monthly detail view (e.g. 2026-09)
│   └── tambah.tsx            # Expense modal (Create / Edit with Math Operator Bar)
├── components/               # Specialized UI Components
│   ├── OperatorBar.tsx       # Custom math operator keyboard extension (+ − × ÷)
│   ├── TotalCard.tsx         # Prominent top total display
│   ├── ExpenseRow.tsx        # Optimized expense list row
│   └── MoneyText.tsx         # Locale-aware Indonesian Rupiah formatter
├── lib/                      # Core Logic & Utilities
│   ├── evalExpr.ts           # Custom AST math expression tokenizer & parser (Zero-eval)
│   ├── db.ts                 # Asynchronous SQLite database layer with parameter binding
│   ├── date.ts               # Local timezone date helpers (prevents UTC drift)
│   ├── format.ts             # Currency & display formatters
│   └── backup.ts             # JSON export/import backup engine via Expo FileSystem & Sharing
└── constants/                # UI strings & color tokens
```

### 💡 High-Rigor Engineering Practices
- **Safe Math Tokenizer & Parser (`lib/evalExpr.ts`):** Evaluates arithmetic string expressions safely using a recursive descent parser. Completely avoids JS `eval()` or `Function()` constructors to maintain security.
- **Local Timezone Guard (`lib/date.ts`):** Standard `toISOString()` shifts dates in UTC+7 (Indonesia WIB) leading to wrong transaction dates for midnight records. Custom helpers ensure strict local date formatting (`YYYY-MM-DD`).
- **Async SQLite Parameter Binding (`lib/db.ts`):** Utilizes `expo-sqlite` async APIs (`getAllAsync`, `runAsync`) with strict parameter binding (`?`) to guarantee zero SQL injection risks.
- **Strict TypeScript & Testing:** 100% type safety with `strict: true` and unit-tested core modules using `jest-expo` and `@testing-library/react-native`.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology |
|---|---|
| **Framework** | [React Native 0.86](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Database** | [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (`openDatabaseAsync`) |
| **Styling** | [NativeWind v4](https://www.nativewind.dev/) / React Native `StyleSheet` |
| **Date Picker** | `@react-native-community/datetimepicker` |
| **File I/O & Backup** | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| **Testing** | `jest-expo`, `@testing-library/react-native` |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Expo Go app on iOS/Android device OR Android Emulator / iOS Simulator

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

4. **Start local dev server:**
   ```bash
   npx expo start
   ```

---

## 📝 Technical Decisions & Architecture Log

All technical architecture decisions, library choices, and trade-offs are documented in [DECISIONS.md](DECISIONS.md).

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.

---

<p center>Crafted with precision by <strong>Andrew</strong> (Soradev Studio)</p>
