# Moneta — Expense Tracker

A calm, responsive personal expense tracker built with React and TypeScript. Track everyday spending, explore trends, and keep your data on your device.

## Features

- Dashboard with totals for all time, this month, today, and transaction count
- Category breakdown and recent monthly spending charts
- Add, edit, search, filter, sort, export, and delete transactions
- INR currency formatting and date-aware month filtering
- Persistent light and dark themes
- First-run sample data, responsive layouts, and accessible form labels
- Local browser storage; no account or backend required

## Tech stack

React, TypeScript, Vite, Recharts, Lucide React, and modern CSS.

## Project structure

```text
src/
  App.tsx       Application pages, forms, charts, and transaction flows
  data.ts       First-run sample transactions
  index.css     Responsive light/dark design system
  main.tsx      React entry point
  types.ts      Expense and selection types
  utils.ts      Currency, date, and data validation helpers
```

## Getting started

### Installation

```sh
npm install
```

### Run locally

```sh
npm run dev
```

### Build for production

```sh
npm run build
npm run preview
```

Run `npm run lint` for static checks.

## How data storage works

Expenses are stored in this browser's `localStorage` under `moneta-expenses-v1`; the theme is stored under `moneta-theme-v1`. On the first visit, sample transactions are added so the dashboard is immediately useful. Use **Settings → Reset all data** to clear saved transactions. Clearing browser storage also removes them. This app does not send your data to a server.

## Screenshots

_Add screenshots here._

## Future improvements

- Configurable currency and budgets
- Import transactions from a CSV file
- Optional recurring expense reminders

## Deploying to GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
3. Add a workflow that runs `npm ci` and `npm run build`, then publishes the generated `dist` directory with GitHub's Pages artifact actions.
4. If deploying from a repository subpath, set Vite's `base` option to `/<repository-name>/` in `vite.config.ts` before building.
# Moneta
