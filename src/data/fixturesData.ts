export type Game = {
  status: "FT" | "LIVE" | "TBC" | string;
  kickOff: string;
  home: string;
  away: string;
  venue: string;
  homeScore?: number;
  awayScore?: number;
};

export type FixtureDay = {
  date: string;
  sortDate: string;
  games: Game[];
};

export const fixturesData: FixtureDay[] = [
  {
    date: "Thursday 4th June",
    sortDate: "2026-06-04",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Leeds Rhinos",
        away: "St Helens",
        homeScore: 24,
        awayScore: 16,
        venue: "Headingley Stadium",
      },
    ],
  },
  {
    date: "Friday 5th June",
    sortDate: "2026-06-05",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Bradford Bulls",
        away: "York Knights",
        homeScore: 30,
        awayScore: 20,
        venue: "Odsal Stadium",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Castleford Tigers",
        away: "Leigh Leopards",
        homeScore: 14,
        awayScore: 24,
        venue: "The Jungle",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Warrington Wolves",
        away: "Hull FC",
        homeScore: 12,
        awayScore: 4,
        venue: "Halliwell Jones Stadium",
      },
    ],
  },
  {
    date: "Saturday 6th June",
    sortDate: "2026-06-06",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Huddersfield Giants",
        away: "Toulouse",
        homeScore: 16,
        awayScore: 36,
        venue: "John Smith's Stadium",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Wakefield Trinity",
        away: "Hull Kingston Rovers",
        homeScore: 26,
        awayScore: 24,
        venue: "Belle Vue",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Catalans Dragons",
        away: "Wigan Warriors",
        homeScore: 16,
        awayScore: 40,
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Thursday 11th June",
    sortDate: "2026-06-11",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "St Helens",
        away: "Warrington Wolves",
        homeScore: 6,
        awayScore: 18,
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Friday 12th June",
    sortDate: "2026-06-12",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Toulouse",
        away: "Leeds Rhinos",
        homeScore: 24,
        awayScore: 48,
        venue: "Stade Ernest Wallon",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Hull Kingston Rovers",
        away: "York Knights",
        homeScore: 38,
        awayScore: 6,
        venue: "Craven Park",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Wakefield Trinity",
        away: "Wigan Warriors",
        homeScore: 10,
        awayScore: 48,
        venue: "Belle Vue",
      },
    ],
  },
  {
    date: "Saturday 13th June",
    sortDate: "2026-06-13",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Hull FC",
        away: "Huddersfield Giants",
        homeScore: 36,
        awayScore: 12,
        venue: "MKM Stadium",
      },
      {
        status: "FT",
        kickOff: "TBC",
        home: "Catalans Dragons",
        away: "Castleford Tigers",
        homeScore: 18,
        awayScore: 4,
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Sunday 14th June",
    sortDate: "2026-06-14",
    games: [
      {
        status: "FT",
        kickOff: "TBC",
        home: "Bradford Bulls",
        away: "Leigh Leopards",
        homeScore: 12,
  awayScore: 38,
        venue: "Odsal Stadium",
      },
    ],
  },
  {
    date: "Thursday 18th June",
    sortDate: "2026-06-18",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Warrington Wolves",
        away: "Leeds Rhinos",
        venue: "Halliwell Jones Stadium",
      },
    ],
  },
  {
    date: "Friday 19th June",
    sortDate: "2026-06-19",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull FC",
        away: "Wakefield Trinity",
        venue: "MKM Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull Kingston Rovers",
        away: "Leigh Leopards",
        venue: "Craven Park",
      },
    ],
  },
  {
    date: "Saturday 20th June",
    sortDate: "2026-06-20",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "York Knights",
        away: "Wigan Warriors",
        venue: "LNER Community Stadium",
      },
      {
        status: "18:00",
        kickOff: "18:00",
        home: "Catalans Dragons",
        away: "Bradford Bulls",
        venue: "Stade Gilbert Brutus",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Castleford Tigers",
        away: "Toulouse",
        venue: "The Jungle",
      },
    ],
  },
  {
    date: "Sunday 21st June",
    sortDate: "2026-06-21",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "St Helens",
        away: "Huddersfield Giants",
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Thursday 25th June",
    sortDate: "2026-06-25",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Warrington Wolves",
        away: "Catalans Dragons",
        venue: "Halliwell Jones Stadium",
      },
    ],
  },
  {
    date: "Friday 26th June",
    sortDate: "2026-06-26",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Castleford Tigers",
        away: "York Knights",
        venue: "The Jungle",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leeds Rhinos",
        away: "Hull Kingston Rovers",
        venue: "Headingley Stadium",
      },
    ],
  },
  {
    date: "Saturday 27th June",
    sortDate: "2026-06-27",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Hull FC",
        away: "Wigan Warriors",
        venue: "MKM Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Bradford Bulls",
        away: "St Helens",
        venue: "Odsal Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Toulouse",
        away: "Leigh Leopards",
        venue: "Stade Ernest Wallon",
      },
    ],
  },
  {
    date: "Sunday 28th June",
    sortDate: "2026-06-28",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Wakefield Trinity",
        away: "Huddersfield Giants",
        venue: "Belle Vue",
      },
    ],
  },
  {
    date: "Saturday 4th July",
    sortDate: "2026-07-04",
    games: [
      {
        status: "12:30",
        kickOff: "12:30",
        home: "Huddersfield Giants",
        away: "York Knights",
        venue: "John Smith's Stadium",
      },
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Hull Kingston Rovers",
        away: "Hull FC",
        venue: "Craven Park",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Leigh Leopards",
        away: "Warrington Wolves",
        venue: "Leigh Sports Village",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Catalans Dragons",
        away: "Toulouse",
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Sunday 5th July",
    sortDate: "2026-07-05",
    games: [
      {
        status: "12:30",
        kickOff: "12:30",
        home: "Wakefield Trinity",
        away: "Castleford Tigers",
        venue: "Belle Vue",
      },
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Leeds Rhinos",
        away: "Bradford Bulls",
        venue: "Headingley Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Wigan Warriors",
        away: "St Helens",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Thursday 9th July",
    sortDate: "2026-07-09",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "York Knights",
        away: "Hull FC",
        venue: "LNER Community Stadium",
      },
    ],
  },
  {
    date: "Friday 10th July",
    sortDate: "2026-07-10",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Huddersfield Giants",
        away: "Bradford Bulls",
        venue: "John Smith's Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wigan Warriors",
        away: "Warrington Wolves",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Saturday 11th July",
    sortDate: "2026-07-11",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Leigh Leopards",
        away: "Castleford Tigers",
        venue: "Leigh Sports Village",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Hull Kingston Rovers",
        away: "Wakefield Trinity",
        venue: "Craven Park",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Catalans Dragons",
        away: "Leeds Rhinos",
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Sunday 12th July",
    sortDate: "2026-07-12",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "St Helens",
        away: "Toulouse",
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Thursday 16th July",
    sortDate: "2026-07-16",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Bradford Bulls",
        away: "Wakefield Trinity",
        venue: "Odsal Stadium",
      },
    ],
  },
  {
    date: "Friday 17th July",
    sortDate: "2026-07-17",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Huddersfield Giants",
        away: "Wigan Warriors",
        venue: "John Smith's Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "St Helens",
        away: "Catalans Dragons",
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Saturday 18th July",
    sortDate: "2026-07-18",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Warrington Wolves",
        away: "Hull Kingston Rovers",
        venue: "Halliwell Jones Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Hull FC",
        away: "Leigh Leopards",
        venue: "MKM Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Toulouse",
        away: "York Knights",
        venue: "Stade Ernest Wallon",
      },
    ],
  },
  {
    date: "Sunday 19th July",
    sortDate: "2026-07-19",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Castleford Tigers",
        away: "Leeds Rhinos",
        venue: "The Jungle",
      },
    ],
  },
  {
    date: "Thursday 23rd July",
    sortDate: "2026-07-23",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull FC",
        away: "Hull Kingston Rovers",
        venue: "MKM Stadium",
      },
    ],
  },
  {
    date: "Friday 24th July",
    sortDate: "2026-07-24",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wakefield Trinity",
        away: "Castleford Tigers",
        venue: "Belle Vue",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wigan Warriors",
        away: "St Helens",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Saturday 25th July",
    sortDate: "2026-07-25",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "York Knights",
        away: "Huddersfield Giants",
        venue: "LNER Community Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Leigh Leopards",
        away: "Warrington Wolves",
        venue: "Leigh Sports Village",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Toulouse",
        away: "Catalans Dragons",
        venue: "Stade Ernest Wallon",
      },
    ],
  },
  {
    date: "Sunday 26th July",
    sortDate: "2026-07-26",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Leeds Rhinos",
        away: "Bradford Bulls",
        venue: "Headingley Stadium",
      },
    ],
  },
  {
    date: "Thursday 30th July",
    sortDate: "2026-07-30",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Huddersfield Giants",
        away: "Hull FC",
        venue: "John Smith's Stadium",
      },
    ],
  },
  {
    date: "Friday 31st July",
    sortDate: "2026-07-31",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull Kingston Rovers",
        away: "Bradford Bulls",
        venue: "Craven Park",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leeds Rhinos",
        away: "Toulouse",
        venue: "Headingley Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leigh Leopards",
        away: "Wigan Warriors",
        venue: "Leigh Sports Village",
      },
    ],
  },
  {
    date: "Saturday 1st August",
    sortDate: "2026-08-01",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Castleford Tigers",
        away: "Warrington Wolves",
        venue: "The Jungle",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "York Knights",
        away: "St Helens",
        venue: "LNER Community Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Catalans Dragons",
        away: "Wakefield Trinity",
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Thursday 6th August",
    sortDate: "2026-08-06",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "St Helens",
        away: "Hull FC",
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Friday 7th August",
    sortDate: "2026-08-07",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Castleford Tigers",
        away: "Hull KR",
        venue: "The Jungle",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leigh Leopards",
        away: "York Knights",
        venue: "Leigh Sports Village",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wakefield Trinity",
        away: "Leeds Rhinos",
        venue: "Belle Vue",
      },
    ],
  },
  {
    date: "Saturday 8th August",
    sortDate: "2026-08-08",
    games: [
      {
        status: "14:00",
        kickOff: "14:00",
        home: "Huddersfield Giants",
        away: "Catalans Dragons",
        venue: "John Smith's Stadium",
      },
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Bradford Bulls",
        away: "Warrington Wolves",
        venue: "Odsal Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Wigan Warriors",
        away: "Toulouse Olympique",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Thursday 13th August",
    sortDate: "2026-08-13",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull KR",
        away: "Catalans Dragons",
        venue: "Craven Park",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leeds Rhinos",
        away: "Leigh Leopards",
        venue: "Headingley Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Warrington Wolves",
        away: "York Knights",
        venue: "Halliwell Jones Stadium",
      },
    ],
  },
  {
    date: "Friday 14th August",
    sortDate: "2026-08-14",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull FC",
        away: "Castleford Tigers",
        venue: "MKM Stadium",
      },
    ],
  },
  {
    date: "Saturday 15th August",
    sortDate: "2026-08-15",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Bradford Bulls",
        away: "Wigan Warriors",
        venue: "Odsal Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Wakefield Trinity",
        away: "St Helens",
        venue: "Belle Vue",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Toulouse Olympique",
        away: "Huddersfield Giants",
        venue: "Stade Ernest Wallon",
      },
    ],
  },
  {
    date: "Tuesday 18th August",
    sortDate: "2026-08-18",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull KR",
        away: "Warrington Wolves",
        venue: "Craven Park",
      },
    ],
  },
  {
    date: "Friday 21st August",
    sortDate: "2026-08-21",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leigh Leopards",
        away: "Bradford Bulls",
        venue: "Leigh Sports Village",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wigan Warriors",
        away: "Wakefield Trinity",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Saturday 22nd August",
    sortDate: "2026-08-22",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "St Helens",
        away: "Castleford Tigers",
        venue: "Totally Wicked Stadium",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Hull KR",
        away: "Toulouse Olympique",
        venue: "Craven Park",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Catalans Dragons",
        away: "Hull FC",
        venue: "Stade Gilbert Brutus",
      },
    ],
  },
  {
    date: "Sunday 23rd August",
    sortDate: "2026-08-23",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Warrington Wolves",
        away: "Huddersfield Giants",
        venue: "Halliwell Jones Stadium",
      },
      {
        status: "15:00",
        kickOff: "15:00",
        home: "York Knights",
        away: "Leeds Rhinos",
        venue: "LNER Community Stadium",
      },
    ],
  },
  {
    date: "Thursday 27th August",
    sortDate: "2026-08-27",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wigan Warriors",
        away: "Hull KR",
        venue: "The Brick Community Stadium",
      },
    ],
  },
  {
    date: "Friday 28th August",
    sortDate: "2026-08-28",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Castleford Tigers",
        away: "Catalans Dragons",
        venue: "The Jungle",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Huddersfield Giants",
        away: "Leigh Leopards",
        venue: "John Smith's Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "St Helens",
        away: "Leeds Rhinos",
        venue: "Totally Wicked Stadium",
      },
    ],
  },
  {
    date: "Saturday 29th August",
    sortDate: "2026-08-29",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Wakefield Trinity",
        away: "York Knights",
        venue: "Belle Vue",
      },
      {
        status: "17:30",
        kickOff: "17:30",
        home: "Hull FC",
        away: "Warrington Wolves",
        venue: "MKM Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Toulouse Olympique",
        away: "Bradford Bulls",
        venue: "Stade Ernest Wallon",
      },
    ],
  },
  {
    date: "Thursday 3rd September",
    sortDate: "2026-09-03",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Bradford Bulls",
        away: "Castleford Tigers",
        venue: "Odsal Stadium",
      },
    ],
  },
  {
    date: "Friday 4th September",
    sortDate: "2026-09-04",
    games: [
      {
        status: "18:00",
        kickOff: "18:00",
        home: "Toulouse Olympique",
        away: "Hull FC",
        venue: "Stade Ernest Wallon",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Hull KR",
        away: "Huddersfield Giants",
        venue: "Craven Park",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leigh Leopards",
        away: "St Helens",
        venue: "Leigh Sports Village",
      },
    ],
  },
  {
    date: "Saturday 5th September",
    sortDate: "2026-09-05",
    games: [
      {
        status: "15:00",
        kickOff: "15:00",
        home: "Wakefield Trinity",
        away: "Warrington Wolves",
        venue: "Belle Vue",
      },
      {
        status: "17:00",
        kickOff: "17:00",
        home: "Catalans Dragons",
        away: "York Knights",
        venue: "Stade Gilbert Brutus",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leeds Rhinos",
        away: "Wigan Warriors",
        venue: "Headingley Stadium",
      },
    ],
  },
  {
    date: "Friday 11th September",
    sortDate: "2026-09-11",
    games: [
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Huddersfield Giants",
        away: "Castleford Tigers",
        venue: "John Smith's Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leeds Rhinos",
        away: "Hull FC",
        venue: "Headingley Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Leigh Leopards",
        away: "Wakefield Trinity",
        venue: "Leigh Sports Village",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "St Helens",
        away: "Hull KR",
        venue: "Totally Wicked Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Warrington Wolves",
        away: "Toulouse Olympique",
        venue: "Halliwell Jones Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "Wigan Warriors",
        away: "Catalans Dragons",
        venue: "The Brick Community Stadium",
      },
      {
        status: "20:00",
        kickOff: "20:00",
        home: "York Knights",
        away: "Bradford Bulls",
        venue: "LNER Community Stadium",
      },
    ],
  },
  {
    date: "Saturday 19th September",
    sortDate: "2026-09-19",
    games: [
      {
        status: "TBC",
        kickOff: "TBC",
        home: "TBC",
        away: "TBC",
        venue: "To be confirmed",
      },
      {
        status: "TBC",
        kickOff: "TBC",
        home: "TBC",
        away: "TBC",
        venue: "To be confirmed",
      },
    ],
  },
  {
    date: "Saturday 26th September",
    sortDate: "2026-09-26",
    games: [
      {
        status: "TBC",
        kickOff: "TBC",
        home: "TBC",
        away: "TBC",
        venue: "To be confirmed",
      },
      {
        status: "TBC",
        kickOff: "TBC",
        home: "TBC",
        away: "TBC",
        venue: "To be confirmed",
      },
    ],
  },
  {
    date: "Saturday 3rd October",
    sortDate: "2026-10-03",
    games: [
      {
        status: "TBC",
        kickOff: "TBC",
        home: "TBC",
        away: "TBC",
        venue: "To be confirmed",
      },
    ],
  },
];