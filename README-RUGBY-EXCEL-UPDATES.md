# Updating Rugby League Results From Excel

Use this file as your single update sheet:

`src/data/superLeagueMatches.xlsx`

## How to add a new result

1. Open `src/data/superLeagueMatches.xlsx`
2. Find the fixture row
3. Add the `Home Score` and `Away Score`
4. Change `Status` to `FT`
5. Save the Excel file
6. In the project folder, run:

```bash
npm run update-rugby-data
npm run build
```

The update script rebuilds these two files automatically:

- `src/data/fixturesData.ts`
- `src/data/leagueTableData.ts`

## First-time setup

The Excel reader package is needed for the update command. Run this once:

```bash
npm install xlsx
```

After that, use:

```bash
npm run update-rugby-data
```

## Important

Do not manually edit `fixturesData.ts` or `leagueTableData.ts` unless you really need to.
The Excel sheet should now be your main source of truth.
