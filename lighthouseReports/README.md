# Lighthouse Reports

This folder collects every Lighthouse HTML report generated against the AlgoArena frontend.

## Generating a new report

1. Build and preview the app:
   ```powershell
   npm run build
   npm run preview
   ```
   The preview server listens on `http://localhost:4173/`.

2. In a second terminal, run one of the audit scripts:

   | Script              | Target page                              | Output file                                    |
   | ------------------- | ---------------------------------------- | ---------------------------------------------- |
   | `npm run lh:landing`    | `/`                                  | `lighthouseReports/landing.report.html`        |
   | `npm run lh:full`       | `/` (all 4 categories)               | `lighthouseReports/landing-full.report.html`   |
   | `npm run lh:challenges` | `/challenges`                        | `lighthouseReports/challenges.report.html`     |
   | `npm run lh:community`  | `/community`                         | `lighthouseReports/community.report.html`      |
   | `npm run lh:battles`    | `/battles`                           | `lighthouseReports/battles.report.html`        |
   | `npm run lh:leaderboard`| `/leaderboard`                       | `lighthouseReports/leaderboard.report.html`    |

   The `--view` flag opens the HTML report in your default browser as soon as the run finishes.

3. The script overwrites the same file each run. To preserve history, rename the file before re-running, e.g.:
   ```powershell
   Rename-Item lighthouseReports/landing-full.report.html "landing-full_$(Get-Date -Format yyyy-MM-dd_HH-mm).report.html"
   ```

## Tips

- **Run in incognito** (or pass `--chrome-flags="--incognito"` to lighthouse) to avoid the *"There may be stored data affecting loading performance in this location: IndexedDB"* warning.
- **Close other tabs/extensions** during the run; CPU contention skews TBT badly.
- Edge / Brave / Chrome can all run Lighthouse from DevTools too — those reports can be saved here manually.

## Historical reports

| File                                          | Date       | Notes                                    |
| --------------------------------------------- | ---------- | ---------------------------------------- |
| `localhost_2026-04-23_23-30-07.report.html`   | 2026-04-23 | Baseline before any optimization         |
| `localhost_2026-04-23_23-53-30.report.html`   | 2026-04-23 | After SEO + heading-hierarchy fixes      |
| `localhost_2026-04-24_00-25-52.report.html`   | 2026-04-24 | After image / lazy-loading optimizations |
| `localhost_2026-04-24_00-45-46.report.html`   | 2026-04-24 | After CLS + memoization fixes            |
