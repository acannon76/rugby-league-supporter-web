DriverOS - Report 7 Driver Behaviour & Coaching Dashboard
Created: 03 September 2026

New route:
/internal/app-ideas/link-message-mock/reports/option-7

What was added
- New Report 7 card in the Reports directory.
- Driver Behaviour & Coaching Dashboard for Advanced Driver Coaches (ADCs).
- Default driver table is alphabetical A-Z, not a league table.
- ADCs can deliberately sort any behaviour by Needs most attention first or Strongest first.
- Driver score, selected-site score and national score.
- Driver-controllable behaviour measures:
  * Harsh acceleration
  * Harsh braking
  * Speed compliance
  * Cornering control
  * Idling management
  * Engine over-revving
- Harsh-event measures are normalised per 100 miles; idling is based on engine-on time.
- MPG is intentionally excluded from the driver score because route, vehicle and load can make MPG an unfair driver comparison.
- Coaching status bands: Priority coaching, Coaching review, Performing well.
- Selected driver coaching profile with local and national comparisons.
- ADC assurance section for core training, Safe Systems of Work and vehicle changeover checks.
- Vehicle-use list for the selected driver.
- Exact reporting-site dropdown recreated from the supplied screenshots.
- Dummy data for 229 drivers across 42 reporting sites.
- Excel, CSV and presentation PDF downloads.
- Excel workbook includes Summary, Driver Behaviour, Site Scores and Selected Driver sheets.

Scoring model
- All behaviour scores are 0-100; higher is stronger.
- Overall weighting:
  Harsh braking 25%
  Speed compliance 20%
  Harsh acceleration 15%
  Cornering control 15%
  Engine over-revving 15%
  Idling management 10%
- The interface describes the output as a coaching indicator rather than a productivity or disciplinary ranking.

Changed/new source files
- src/app/internal/app-ideas/link-message-mock/reports/page.tsx
- src/app/internal/app-ideas/link-message-mock/reports/option-7/page.tsx
- src/app/internal/app-ideas/link-message-mock/reports/option-7/DriverBehaviourDashboard.tsx
- src/app/internal/app-ideas/link-message-mock/reports/option-7/driverBehaviourData.ts

Validation
- TypeScript: node node_modules/typescript/bin/tsc --noEmit - PASSED
- ESLint on changed/new files - PASSED
- Full Next.js build could not be completed in the sandbox because the extracted Windows node_modules does not contain the Linux SWC binary and the sandbox cannot download it. TypeScript and lint validation completed successfully.
