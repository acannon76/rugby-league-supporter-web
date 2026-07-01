"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type DutyOption = {
  duty: string;
  start: string;
  finish: string;
  startLocation: string;
  endLocation: string;
  totalTime: string;
  crossesMidnight: boolean;
};

const sidebarItems = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  {
    label: "Comms",
    icon: "💬",
    href: "/internal/app-ideas/link-message-mock/comms",
    alertCount: 4,
  },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team", active: true },
];

const rawDutyOptions = [
  {
    "duty": "CONNW3174SUN",
    "start": "13:40",
    "finish": "01:50"
  },
  {
    "duty": "CONNW3181A",
    "start": "15:00",
    "finish": "21:35"
  },
  {
    "duty": "CONNWH3174",
    "start": "11:15",
    "finish": "22:05"
  },
  {
    "duty": "CONNWH3201",
    "start": "15:10",
    "finish": "01:45"
  },
  {
    "duty": "CONNWH3259",
    "start": "07:20",
    "finish": "21:00"
  },
  {
    "duty": "CONNWH3269",
    "start": "09:00",
    "finish": "20:00"
  },
  {
    "duty": "CONNWH3274",
    "start": "17:30",
    "finish": "03:10"
  },
  {
    "duty": "FPM",
    "start": "04:00",
    "finish": "14:24"
  },
  {
    "duty": "NWH001",
    "start": "00:00",
    "finish": "08:00"
  },
  {
    "duty": "NWH002",
    "start": "00:30",
    "finish": "09:15"
  },
  {
    "duty": "NWH003",
    "start": "00:40",
    "finish": "08:40"
  },
  {
    "duty": "NWH004",
    "start": "00:40",
    "finish": "08:40"
  },
  {
    "duty": "NWH005",
    "start": "00:50",
    "finish": "12:30"
  },
  {
    "duty": "NWH006",
    "start": "00:50",
    "finish": "10:20"
  },
  {
    "duty": "NWH007",
    "start": "00:20",
    "finish": "10:50"
  },
  {
    "duty": "NWH007A",
    "start": "00:20",
    "finish": "10:50"
  },
  {
    "duty": "NWH008",
    "start": "00:45",
    "finish": "13:00"
  },
  {
    "duty": "NWH009",
    "start": "00:25",
    "finish": "11:41"
  },
  {
    "duty": "NWH010",
    "start": "01:20",
    "finish": "12:30"
  },
  {
    "duty": "NWH011",
    "start": "01:35",
    "finish": "09:35"
  },
  {
    "duty": "NWH012",
    "start": "02:30",
    "finish": "12:45"
  },
  {
    "duty": "NWH014",
    "start": "03:05",
    "finish": "11:45"
  },
  {
    "duty": "NWH015",
    "start": "06:15",
    "finish": "17:40"
  },
  {
    "duty": "NWH017",
    "start": "03:40",
    "finish": "13:20"
  },
  {
    "duty": "NWH018",
    "start": "03:45",
    "finish": "10:35"
  },
  {
    "duty": "NWH019",
    "start": "03:30",
    "finish": "10:35"
  },
  {
    "duty": "NWH020",
    "start": "04:35",
    "finish": "13:30"
  },
  {
    "duty": "NWH021",
    "start": "04:40",
    "finish": "12:40"
  },
  {
    "duty": "NWH022",
    "start": "04:50",
    "finish": "14:25"
  },
  {
    "duty": "NWH024A",
    "start": "02:40",
    "finish": "14:10"
  },
  {
    "duty": "NWH024B",
    "start": "05:15",
    "finish": "14:10"
  },
  {
    "duty": "NWH025",
    "start": "05:15",
    "finish": "16:45"
  },
  {
    "duty": "NWH027",
    "start": "05:55",
    "finish": "15:35"
  },
  {
    "duty": "NWH030",
    "start": "05:00",
    "finish": "15:45"
  },
  {
    "duty": "NWH032",
    "start": "04:00",
    "finish": "12:00"
  },
  {
    "duty": "NWH034",
    "start": "05:00",
    "finish": "16:20"
  },
  {
    "duty": "NWH035",
    "start": "04:30",
    "finish": "16:30"
  },
  {
    "duty": "NWH036",
    "start": "01:00",
    "finish": "12:50"
  },
  {
    "duty": "NWH201",
    "start": "06:00",
    "finish": "16:20"
  },
  {
    "duty": "NWH202",
    "start": "06:00",
    "finish": "18:00"
  },
  {
    "duty": "NWH203",
    "start": "06:05",
    "finish": "18:00"
  },
  {
    "duty": "NWH204",
    "start": "06:05",
    "finish": "16:10"
  },
  {
    "duty": "NWH205A",
    "start": "04:10",
    "finish": "15:40"
  },
  {
    "duty": "NWH205B",
    "start": "06:10",
    "finish": "15:40"
  },
  {
    "duty": "NWH207",
    "start": "06:15",
    "finish": "15:10"
  },
  {
    "duty": "NWH208",
    "start": "05:15",
    "finish": "15:40"
  },
  {
    "duty": "NWH209",
    "start": "06:15",
    "finish": "14:15"
  },
  {
    "duty": "NWH214",
    "start": "06:20",
    "finish": "16:55"
  },
  {
    "duty": "NWH217",
    "start": "06:50",
    "finish": "17:20"
  },
  {
    "duty": "NWH217A",
    "start": "09:00",
    "finish": "13:45"
  },
  {
    "duty": "NWH219",
    "start": "06:30",
    "finish": "15:40"
  },
  {
    "duty": "NWH220",
    "start": "07:20",
    "finish": "18:30"
  },
  {
    "duty": "NWH2201",
    "start": "05:50",
    "finish": "17:10"
  },
  {
    "duty": "NWH221",
    "start": "07:30",
    "finish": "18:46"
  },
  {
    "duty": "NWH222",
    "start": "07:30",
    "finish": "18:15"
  },
  {
    "duty": "NWH223",
    "start": "07:30",
    "finish": "18:30"
  },
  {
    "duty": "NWH226",
    "start": "08:00",
    "finish": "18:49"
  },
  {
    "duty": "NWH228",
    "start": "08:30",
    "finish": "18:35"
  },
  {
    "duty": "NWH230",
    "start": "08:55",
    "finish": "19:00"
  },
  {
    "duty": "NWH231",
    "start": "09:00",
    "finish": "20:50"
  },
  {
    "duty": "NWH232",
    "start": "09:00",
    "finish": "19:50"
  },
  {
    "duty": "NWH233",
    "start": "09:00",
    "finish": "18:50"
  },
  {
    "duty": "NWH235",
    "start": "09:15",
    "finish": "21:00"
  },
  {
    "duty": "NWH236",
    "start": "07:30",
    "finish": "17:55"
  },
  {
    "duty": "NWH237",
    "start": "09:30",
    "finish": "18:38"
  },
  {
    "duty": "NWH238",
    "start": "09:40",
    "finish": "18:30"
  },
  {
    "duty": "NWH242",
    "start": "10:20",
    "finish": "19:00"
  },
  {
    "duty": "NWH243",
    "start": "10:45",
    "finish": "18:45"
  },
  {
    "duty": "NWH244",
    "start": "11:00",
    "finish": "21:45"
  },
  {
    "duty": "NWH245",
    "start": "11:00",
    "finish": "22:30"
  },
  {
    "duty": "NWH249",
    "start": "11:20",
    "finish": "22:00"
  },
  {
    "duty": "NWH250",
    "start": "11:20",
    "finish": "20:10"
  },
  {
    "duty": "NWH253",
    "start": "11:00",
    "finish": "21:35"
  },
  {
    "duty": "NWH254",
    "start": "11:30",
    "finish": "21:20"
  },
  {
    "duty": "NWH256",
    "start": "09:30",
    "finish": "20:35"
  },
  {
    "duty": "NWH258",
    "start": "06:00",
    "finish": "15:35"
  },
  {
    "duty": "NWH401",
    "start": "09:00",
    "finish": "21:40"
  },
  {
    "duty": "NWH402",
    "start": "12:00",
    "finish": "23:33"
  },
  {
    "duty": "NWH403",
    "start": "12:05",
    "finish": "22:55"
  },
  {
    "duty": "NWH405",
    "start": "12:15",
    "finish": "23:35"
  },
  {
    "duty": "NWH406",
    "start": "12:15",
    "finish": "22:50"
  },
  {
    "duty": "NWH409",
    "start": "12:30",
    "finish": "21:35"
  },
  {
    "duty": "NWH410",
    "start": "12:40",
    "finish": "00:00"
  },
  {
    "duty": "NWH411",
    "start": "12:45",
    "finish": "20:45"
  },
  {
    "duty": "NWH412",
    "start": "12:50",
    "finish": "20:50"
  },
  {
    "duty": "NWH413",
    "start": "12:50",
    "finish": "22:00"
  },
  {
    "duty": "NWH415",
    "start": "12:55",
    "finish": "23:05"
  },
  {
    "duty": "NWH418",
    "start": "13:05",
    "finish": "22:20"
  },
  {
    "duty": "NWH419",
    "start": "13:10",
    "finish": "23:25"
  },
  {
    "duty": "NWH421",
    "start": "13:15",
    "finish": "23:25"
  },
  {
    "duty": "NWH422",
    "start": "13:20",
    "finish": "23:45"
  },
  {
    "duty": "NWH423A",
    "start": "13:25",
    "finish": "22:50"
  },
  {
    "duty": "NWH425B",
    "start": "13:35",
    "finish": "21:10"
  },
  {
    "duty": "NWH426",
    "start": "13:35",
    "finish": "00:05"
  },
  {
    "duty": "NWH428",
    "start": "13:55",
    "finish": "21:55"
  },
  {
    "duty": "NWH430",
    "start": "14:00",
    "finish": "23:42"
  },
  {
    "duty": "NWH431",
    "start": "14:05",
    "finish": "01:55"
  },
  {
    "duty": "NWH432",
    "start": "14:05",
    "finish": "22:05"
  },
  {
    "duty": "NWH434",
    "start": "14:15",
    "finish": "22:20"
  },
  {
    "duty": "NWH435",
    "start": "13:50",
    "finish": "00:05"
  },
  {
    "duty": "NWH436",
    "start": "14:25",
    "finish": "02:20"
  },
  {
    "duty": "NWH437",
    "start": "14:30",
    "finish": "22:55"
  },
  {
    "duty": "NWH438",
    "start": "14:30",
    "finish": "00:15"
  },
  {
    "duty": "NWH439",
    "start": "14:30",
    "finish": "00:15"
  },
  {
    "duty": "NWH440",
    "start": "14:35",
    "finish": "23:40"
  },
  {
    "duty": "NWH441",
    "start": "14:40",
    "finish": "21:15"
  },
  {
    "duty": "NWH442T",
    "start": "15:10",
    "finish": "02:10"
  },
  {
    "duty": "NWH443",
    "start": "15:00",
    "finish": "02:10"
  },
  {
    "duty": "NWH445",
    "start": "15:15",
    "finish": "01:50"
  },
  {
    "duty": "NWH446",
    "start": "15:20",
    "finish": "00:20"
  },
  {
    "duty": "NWH447",
    "start": "15:20",
    "finish": "01:50"
  },
  {
    "duty": "NWH449",
    "start": "15:30",
    "finish": "03:15"
  },
  {
    "duty": "NWH450",
    "start": "15:25",
    "finish": "02:55"
  },
  {
    "duty": "NWH451",
    "start": "14:30",
    "finish": "22:55"
  },
  {
    "duty": "NWH452",
    "start": "15:30",
    "finish": "03:20"
  },
  {
    "duty": "NWH453A",
    "start": "15:30",
    "finish": "23:30"
  },
  {
    "duty": "NWH453B",
    "start": "15:00",
    "finish": "23:30"
  },
  {
    "duty": "NWH454",
    "start": "15:35",
    "finish": "01:45"
  },
  {
    "duty": "NWH456",
    "start": "15:45",
    "finish": "23:10"
  },
  {
    "duty": "NWH457",
    "start": "15:00",
    "finish": "23:00"
  },
  {
    "duty": "NWH458",
    "start": "15:50",
    "finish": "22:40"
  },
  {
    "duty": "NWH459",
    "start": "15:50",
    "finish": "02:10"
  },
  {
    "duty": "NWH460",
    "start": "15:52",
    "finish": "03:10"
  },
  {
    "duty": "NWH461A",
    "start": "15:55",
    "finish": "23:55"
  },
  {
    "duty": "NWH461B",
    "start": "15:25",
    "finish": "23:25"
  },
  {
    "duty": "NWH463",
    "start": "16:00",
    "finish": "03:30"
  },
  {
    "duty": "NWH464",
    "start": "14:15",
    "finish": "21:40"
  },
  {
    "duty": "NWH465",
    "start": "16:05",
    "finish": "01:45"
  },
  {
    "duty": "NWH467",
    "start": "16:25",
    "finish": "03:30"
  },
  {
    "duty": "NWH470",
    "start": "16:35",
    "finish": "02:40"
  },
  {
    "duty": "NWH473",
    "start": "16:45",
    "finish": "01:25"
  },
  {
    "duty": "NWH475",
    "start": "16:20",
    "finish": "00:40"
  },
  {
    "duty": "NWH476",
    "start": "16:50",
    "finish": "01:00"
  },
  {
    "duty": "NWH477",
    "start": "16:45",
    "finish": "03:00"
  },
  {
    "duty": "NWH481",
    "start": "16:30",
    "finish": "04:05"
  },
  {
    "duty": "NWH483",
    "start": "17:25",
    "finish": "03:40"
  },
  {
    "duty": "NWH484",
    "start": "17:30",
    "finish": "04:30"
  },
  {
    "duty": "NWH485",
    "start": "17:30",
    "finish": "04:15"
  },
  {
    "duty": "NWH486",
    "start": "17:45",
    "finish": "05:40"
  },
  {
    "duty": "NWH489",
    "start": "13:40",
    "finish": "22:05"
  },
  {
    "duty": "NWH493",
    "start": "16:00",
    "finish": "00:00"
  },
  {
    "duty": "NWH601",
    "start": "18:20",
    "finish": "00:25"
  },
  {
    "duty": "NWH603",
    "start": "18:05",
    "finish": "02:05"
  },
  {
    "duty": "NWH603A",
    "start": "18:05",
    "finish": "02:05"
  },
  {
    "duty": "NWH605",
    "start": "18:20",
    "finish": "06:40"
  },
  {
    "duty": "NWH608",
    "start": "18:45",
    "finish": "05:55"
  },
  {
    "duty": "NWH610",
    "start": "19:30",
    "finish": "06:30"
  },
  {
    "duty": "NWH612",
    "start": "19:50",
    "finish": "07:31"
  },
  {
    "duty": "NWH613",
    "start": "20:00",
    "finish": "07:20"
  },
  {
    "duty": "NWH614",
    "start": "20:00",
    "finish": "06:20"
  },
  {
    "duty": "NWH616",
    "start": "20:05",
    "finish": "08:10"
  },
  {
    "duty": "NWH617",
    "start": "20:05",
    "finish": "04:25"
  },
  {
    "duty": "NWH618",
    "start": "20:30",
    "finish": "06:15"
  },
  {
    "duty": "NWH622",
    "start": "20:45",
    "finish": "07:55"
  },
  {
    "duty": "NWH623",
    "start": "20:50",
    "finish": "07:55"
  },
  {
    "duty": "NWH624",
    "start": "20:45",
    "finish": "06:20"
  },
  {
    "duty": "NWH627",
    "start": "20:55",
    "finish": "05:20"
  },
  {
    "duty": "NWH628",
    "start": "21:00",
    "finish": "07:55"
  },
  {
    "duty": "NWH629",
    "start": "21:15",
    "finish": "07:15"
  },
  {
    "duty": "NWH630",
    "start": "21:25",
    "finish": "05:55"
  },
  {
    "duty": "NWH631",
    "start": "21:30",
    "finish": "08:40"
  },
  {
    "duty": "NWH633",
    "start": "21:30",
    "finish": "09:45"
  },
  {
    "duty": "NWH634",
    "start": "21:40",
    "finish": "07:10"
  },
  {
    "duty": "NWH635",
    "start": "21:45",
    "finish": "09:55"
  },
  {
    "duty": "NWH636",
    "start": "21:50",
    "finish": "09:10"
  },
  {
    "duty": "NWH638",
    "start": "22:10",
    "finish": "07:40"
  },
  {
    "duty": "NWH640",
    "start": "22:15",
    "finish": "08:20"
  },
  {
    "duty": "NWH642",
    "start": "22:20",
    "finish": "09:10"
  },
  {
    "duty": "NWH643",
    "start": "22:30",
    "finish": "07:55"
  },
  {
    "duty": "NWH644",
    "start": "22:45",
    "finish": "09:45"
  },
  {
    "duty": "NWH645",
    "start": "22:40",
    "finish": "09:56"
  },
  {
    "duty": "NWH648",
    "start": "22:35",
    "finish": "09:45"
  },
  {
    "duty": "NWH649",
    "start": "23:45",
    "finish": "11:15"
  },
  {
    "duty": "NWH650",
    "start": "22:50",
    "finish": "09:20"
  },
  {
    "duty": "NWH655",
    "start": "23:25",
    "finish": "10:43"
  },
  {
    "duty": "NWH801",
    "start": "00:45",
    "finish": "13:00"
  },
  {
    "duty": "NWH803",
    "start": "00:25",
    "finish": "11:41"
  },
  {
    "duty": "NWH804",
    "start": "01:20",
    "finish": "12:30"
  },
  {
    "duty": "NWH805",
    "start": "01:30",
    "finish": "13:05"
  },
  {
    "duty": "NWH806",
    "start": "01:13",
    "finish": "11:05"
  },
  {
    "duty": "NWH808",
    "start": "03:45",
    "finish": "15:00"
  },
  {
    "duty": "NWH811",
    "start": "04:30",
    "finish": "14:55"
  },
  {
    "duty": "NWH813",
    "start": "22:25",
    "finish": "09:35"
  },
  {
    "duty": "NWH8140",
    "start": "23:15",
    "finish": "08:50"
  },
  {
    "duty": "NWH817",
    "start": "05:00",
    "finish": "13:15"
  },
  {
    "duty": "NWH818",
    "start": "05:00",
    "finish": "15:00"
  },
  {
    "duty": "NWH820",
    "start": "19:00",
    "finish": "05:50"
  },
  {
    "duty": "NWH821",
    "start": "05:20",
    "finish": "15:20"
  },
  {
    "duty": "NWH823",
    "start": "06:15",
    "finish": "16:40"
  },
  {
    "duty": "NWH824",
    "start": "06:20",
    "finish": "16:35"
  },
  {
    "duty": "NWH825",
    "start": "06:25",
    "finish": "16:30"
  },
  {
    "duty": "NWH827",
    "start": "06:30",
    "finish": "18:50"
  },
  {
    "duty": "NWH829",
    "start": "06:35",
    "finish": "17:55"
  },
  {
    "duty": "NWH830",
    "start": "04:00",
    "finish": "13:05"
  },
  {
    "duty": "NWH831",
    "start": "06:50",
    "finish": "18:15"
  },
  {
    "duty": "NWH832",
    "start": "06:55",
    "finish": "15:59"
  },
  {
    "duty": "NWH833",
    "start": "07:10",
    "finish": "16:20"
  },
  {
    "duty": "NWH836",
    "start": "08:40",
    "finish": "19:05"
  },
  {
    "duty": "NWH838",
    "start": "09:00",
    "finish": "21:30"
  },
  {
    "duty": "NWH839",
    "start": "09:00",
    "finish": "18:35"
  },
  {
    "duty": "NWH841",
    "start": "13:05",
    "finish": "21:30"
  },
  {
    "duty": "NWH843",
    "start": "09:40",
    "finish": "20:05"
  },
  {
    "duty": "NWH844",
    "start": "09:40",
    "finish": "19:20"
  },
  {
    "duty": "NWH848",
    "start": "11:15",
    "finish": "21:55"
  },
  {
    "duty": "NWH849",
    "start": "11:25",
    "finish": "19:30"
  },
  {
    "duty": "NWH850",
    "start": "11:35",
    "finish": "21:05"
  },
  {
    "duty": "NWH851",
    "start": "11:30",
    "finish": "19:25"
  },
  {
    "duty": "NWH852",
    "start": "11:55",
    "finish": "22:33"
  },
  {
    "duty": "NWH854",
    "start": "12:20",
    "finish": "00:20"
  },
  {
    "duty": "NWH856",
    "start": "13:10",
    "finish": "00:10"
  },
  {
    "duty": "NWH857",
    "start": "12:52",
    "finish": "23:43"
  },
  {
    "duty": "NWH858",
    "start": "12:55",
    "finish": "23:25"
  },
  {
    "duty": "NWH859",
    "start": "13:00",
    "finish": "22:05"
  },
  {
    "duty": "NWH860",
    "start": "06:30",
    "finish": "17:20"
  },
  {
    "duty": "NWH861",
    "start": "13:05",
    "finish": "22:55"
  },
  {
    "duty": "NWH862",
    "start": "13:40",
    "finish": "01:25"
  },
  {
    "duty": "NWH863",
    "start": "13:50",
    "finish": "00:45"
  },
  {
    "duty": "NWH864",
    "start": "12:25",
    "finish": "22:35"
  },
  {
    "duty": "NWH865",
    "start": "14:00",
    "finish": "01:20"
  },
  {
    "duty": "NWH866",
    "start": "14:05",
    "finish": "01:38"
  },
  {
    "duty": "NWH867",
    "start": "14:35",
    "finish": "02:20"
  },
  {
    "duty": "NWH868",
    "start": "14:35",
    "finish": "23:45"
  },
  {
    "duty": "NWH870",
    "start": "14:55",
    "finish": "01:55"
  },
  {
    "duty": "NWH871",
    "start": "15:00",
    "finish": "02:20"
  },
  {
    "duty": "NWH872",
    "start": "15:10",
    "finish": "03:20"
  },
  {
    "duty": "NWH873",
    "start": "16:05",
    "finish": "01:25"
  },
  {
    "duty": "NWH874",
    "start": "16:35",
    "finish": "04:30"
  },
  {
    "duty": "NWH876",
    "start": "16:55",
    "finish": "04:05"
  },
  {
    "duty": "NWH877",
    "start": "16:30",
    "finish": "04:45"
  },
  {
    "duty": "NWH878",
    "start": "17:10",
    "finish": "04:45"
  },
  {
    "duty": "NWH879",
    "start": "18:00",
    "finish": "05:15"
  },
  {
    "duty": "NWH880",
    "start": "18:00",
    "finish": "04:53"
  },
  {
    "duty": "NWH8801",
    "start": "21:00",
    "finish": "06:20"
  },
  {
    "duty": "NWH8802",
    "start": "21:05",
    "finish": "05:50"
  },
  {
    "duty": "NWH8803",
    "start": "22:00",
    "finish": "06:55"
  },
  {
    "duty": "NWH8804",
    "start": "21:30",
    "finish": "07:00"
  },
  {
    "duty": "NWH8805",
    "start": "21:30",
    "finish": "06:30"
  },
  {
    "duty": "NWH8806",
    "start": "21:30",
    "finish": "07:10"
  },
  {
    "duty": "NWH8807",
    "start": "21:30",
    "finish": "07:10"
  },
  {
    "duty": "NWH8808",
    "start": "21:35",
    "finish": "08:25"
  },
  {
    "duty": "NWH8809",
    "start": "21:40",
    "finish": "07:10"
  },
  {
    "duty": "NWH881",
    "start": "18:00",
    "finish": "02:55"
  },
  {
    "duty": "NWH8810",
    "start": "21:40",
    "finish": "07:55"
  },
  {
    "duty": "NWH8811",
    "start": "21:45",
    "finish": "06:35"
  },
  {
    "duty": "NWH8812",
    "start": "21:55",
    "finish": "07:20"
  },
  {
    "duty": "NWH8813",
    "start": "22:15",
    "finish": "06:40"
  },
  {
    "duty": "NWH8814",
    "start": "22:40",
    "finish": "09:50"
  },
  {
    "duty": "NWH8815",
    "start": "22:50",
    "finish": "09:05"
  },
  {
    "duty": "NWH8816",
    "start": "22:55",
    "finish": "07:40"
  },
  {
    "duty": "NWH8817",
    "start": "23:05",
    "finish": "10:00"
  },
  {
    "duty": "NWH8818",
    "start": "23:05",
    "finish": "08:45"
  },
  {
    "duty": "NWH8819",
    "start": "23:00",
    "finish": "10:10"
  },
  {
    "duty": "NWH882",
    "start": "18:00",
    "finish": "05:45"
  },
  {
    "duty": "NWH8820",
    "start": "23:20",
    "finish": "10:20"
  },
  {
    "duty": "NWH8821",
    "start": "23:30",
    "finish": "11:10"
  },
  {
    "duty": "NWH8823",
    "start": "23:35",
    "finish": "09:10"
  },
  {
    "duty": "NWH8824",
    "start": "23:37",
    "finish": "11:15"
  },
  {
    "duty": "NWH8825",
    "start": "09:05",
    "finish": "19:42"
  },
  {
    "duty": "NWH8826",
    "start": "13:55",
    "finish": "01:23"
  },
  {
    "duty": "NWH8827",
    "start": "16:15",
    "finish": "03:15"
  },
  {
    "duty": "NWH8829",
    "start": "06:40",
    "finish": "18:35"
  },
  {
    "duty": "NWH883",
    "start": "18:15",
    "finish": "05:35"
  },
  {
    "duty": "NWH8830",
    "start": "06:00",
    "finish": "16:16"
  },
  {
    "duty": "NWH8831",
    "start": "08:35",
    "finish": "17:55"
  },
  {
    "duty": "NWH8832",
    "start": "08:55",
    "finish": "19:00"
  },
  {
    "duty": "NWH8833",
    "start": "14:40",
    "finish": "23:30"
  },
  {
    "duty": "NWH884",
    "start": "18:25",
    "finish": "04:55"
  },
  {
    "duty": "NWH885",
    "start": "18:30",
    "finish": "04:10"
  },
  {
    "duty": "NWH886",
    "start": "18:30",
    "finish": "02:35"
  },
  {
    "duty": "NWH887",
    "start": "18:50",
    "finish": "07:20"
  },
  {
    "duty": "NWH888",
    "start": "19:30",
    "finish": "07:20"
  },
  {
    "duty": "NWH890",
    "start": "19:37",
    "finish": "08:00"
  },
  {
    "duty": "NWH892",
    "start": "20:00",
    "finish": "05:05"
  },
  {
    "duty": "NWH893",
    "start": "20:00",
    "finish": "08:00"
  },
  {
    "duty": "NWH894",
    "start": "20:10",
    "finish": "07:10"
  },
  {
    "duty": "NWH896",
    "start": "20:30",
    "finish": "07:30"
  },
  {
    "duty": "NWH901",
    "start": "00:30",
    "finish": "11:50"
  },
  {
    "duty": "NWH902",
    "start": "00:45",
    "finish": "09:45"
  },
  {
    "duty": "NWH9022",
    "start": "11:55",
    "finish": "20:45"
  },
  {
    "duty": "NWH903",
    "start": "01:00",
    "finish": "11:30"
  },
  {
    "duty": "NWH904",
    "start": "01:35",
    "finish": "12:55"
  },
  {
    "duty": "NWH905",
    "start": "01:45",
    "finish": "12:55"
  },
  {
    "duty": "NWH906",
    "start": "01:45",
    "finish": "11:25"
  },
  {
    "duty": "NWH907",
    "start": "01:50",
    "finish": "12:25"
  },
  {
    "duty": "NWH908",
    "start": "13:30",
    "finish": "17:05"
  },
  {
    "duty": "NWH909",
    "start": "13:25",
    "finish": "17:35"
  },
  {
    "duty": "NWH910",
    "start": "02:30",
    "finish": "11:05"
  },
  {
    "duty": "NWH912",
    "start": "03:45",
    "finish": "15:15"
  },
  {
    "duty": "NWH915",
    "start": "07:10",
    "finish": "15:50"
  },
  {
    "duty": "NWH916",
    "start": "07:20",
    "finish": "18:05"
  },
  {
    "duty": "NWH917",
    "start": "08:50",
    "finish": "20:05"
  },
  {
    "duty": "NWH918",
    "start": "09:15",
    "finish": "19:30"
  },
  {
    "duty": "NWH919",
    "start": "09:35",
    "finish": "17:30"
  },
  {
    "duty": "NWH920B",
    "start": "12:55",
    "finish": "18:30"
  },
  {
    "duty": "NWH921",
    "start": "09:40",
    "finish": "19:20"
  },
  {
    "duty": "NWH922",
    "start": "09:45",
    "finish": "19:15"
  },
  {
    "duty": "NWH924",
    "start": "10:55",
    "finish": "23:10"
  },
  {
    "duty": "NWH925",
    "start": "11:05",
    "finish": "22:40"
  },
  {
    "duty": "NWH926",
    "start": "11:15",
    "finish": "19:45"
  },
  {
    "duty": "NWH927",
    "start": "11:35",
    "finish": "22:55"
  },
  {
    "duty": "NWH928",
    "start": "12:30",
    "finish": "16:05"
  },
  {
    "duty": "NWH929",
    "start": "12:35",
    "finish": "23:25"
  },
  {
    "duty": "NWH930",
    "start": "12:35",
    "finish": "22:30"
  },
  {
    "duty": "NWH933",
    "start": "12:50",
    "finish": "22:15"
  },
  {
    "duty": "NWH934",
    "start": "13:00",
    "finish": "23:20"
  },
  {
    "duty": "NWH935",
    "start": "13:20",
    "finish": "23:45"
  },
  {
    "duty": "NWH936",
    "start": "12:30",
    "finish": "02:00"
  },
  {
    "duty": "NWH937",
    "start": "13:10",
    "finish": "00:10"
  },
  {
    "duty": "NWH938",
    "start": "13:30",
    "finish": "01:45"
  },
  {
    "duty": "NWH939",
    "start": "13:50",
    "finish": "01:55"
  },
  {
    "duty": "NWH941",
    "start": "14:35",
    "finish": "00:10"
  },
  {
    "duty": "NWH944",
    "start": "14:45",
    "finish": "23:10"
  },
  {
    "duty": "NWH945",
    "start": "16:30",
    "finish": "01:10"
  },
  {
    "duty": "NWH946",
    "start": "16:30",
    "finish": "04:10"
  },
  {
    "duty": "NWH948",
    "start": "16:45",
    "finish": "04:25"
  },
  {
    "duty": "NWH950",
    "start": "17:15",
    "finish": "04:00"
  },
  {
    "duty": "NWH951",
    "start": "17:30",
    "finish": "05:13"
  },
  {
    "duty": "NWH952",
    "start": "17:55",
    "finish": "02:15"
  },
  {
    "duty": "NWH954",
    "start": "18:25",
    "finish": "06:10"
  },
  {
    "duty": "NWH955",
    "start": "18:50",
    "finish": "07:20"
  },
  {
    "duty": "NWH957",
    "start": "21:00",
    "finish": "06:50"
  },
  {
    "duty": "NWH958",
    "start": "21:00",
    "finish": "07:50"
  },
  {
    "duty": "NWH961",
    "start": "22:10",
    "finish": "08:00"
  },
  {
    "duty": "NWH963",
    "start": "23:30",
    "finish": "10:45"
  },
  {
    "duty": "NWH964",
    "start": "23:35",
    "finish": "11:15"
  },
  {
    "duty": "NWH965",
    "start": "23:35",
    "finish": "05:35"
  },
  {
    "duty": "NWH966",
    "start": "23:00",
    "finish": "10:20"
  },
  {
    "duty": "NWH967",
    "start": "12:20",
    "finish": "20:30"
  },
  {
    "duty": "NWH968",
    "start": "17:20",
    "finish": "02:00"
  },
  {
    "duty": "NWH969",
    "start": "17:55",
    "finish": "02:15"
  },
  {
    "duty": "NWH9901",
    "start": "10:45",
    "finish": "22:15"
  },
  {
    "duty": "NWH9908",
    "start": "11:25",
    "finish": "20:35"
  },
  {
    "duty": "NWH9909",
    "start": "12:05",
    "finish": "21:30"
  },
  {
    "duty": "NWH9910",
    "start": "17:15",
    "finish": "00:45"
  },
  {
    "duty": "NWH9911",
    "start": "20:20",
    "finish": "04:10"
  },
  {
    "duty": "NWHSHUNT01A",
    "start": "04:30",
    "finish": "15:10"
  },
  {
    "duty": "NWHSHUNT01B",
    "start": "04:30",
    "finish": "16:10"
  },
  {
    "duty": "NWHSHUNT02",
    "start": "06:10",
    "finish": "16:40"
  },
  {
    "duty": "NWHSHUNT03A",
    "start": "05:40",
    "finish": "17:10"
  },
  {
    "duty": "NWHSHUNT03B",
    "start": "05:40",
    "finish": "16:10"
  },
  {
    "duty": "NWHSHUNT04",
    "start": "04:00",
    "finish": "14:30"
  },
  {
    "duty": "NWHSHUNT05",
    "start": "05:30",
    "finish": "16:10"
  },
  {
    "duty": "NWHSHUNT05M",
    "start": "04:30",
    "finish": "15:10"
  },
  {
    "duty": "NWHSHUNT06",
    "start": "11:20",
    "finish": "21:45"
  },
  {
    "duty": "NWHSHUNT07",
    "start": "11:40",
    "finish": "22:10"
  },
  {
    "duty": "NWHSHUNT08",
    "start": "12:40",
    "finish": "21:40"
  },
  {
    "duty": "NWHSHUNT09",
    "start": "14:40",
    "finish": "02:40"
  },
  {
    "duty": "NWHSHUNT10A",
    "start": "19:40",
    "finish": "06:40"
  },
  {
    "duty": "NWHSHUNT10B",
    "start": "19:40",
    "finish": "06:40"
  },
  {
    "duty": "NWHSHUNT11",
    "start": "20:40",
    "finish": "05:40"
  },
  {
    "duty": "NWHSHUNT12",
    "start": "20:40",
    "finish": "05:40"
  },
  {
    "duty": "NWHSHUNT13",
    "start": "20:55",
    "finish": "05:55"
  },
  {
    "duty": "NWHSHUNT14",
    "start": "20:10",
    "finish": "07:10"
  },
  {
    "duty": "NWHSHUNT15",
    "start": "15:40",
    "finish": "02:10"
  },
  {
    "duty": "NWHSHUNT16",
    "start": "15:40",
    "finish": "03:10"
  },
  {
    "duty": "NWHSHUNT17",
    "start": "04:30",
    "finish": "15:10"
  },
  {
    "duty": "NWHSHUNT18",
    "start": "06:10",
    "finish": "16:40"
  },
  {
    "duty": "NWHSHUNT19",
    "start": "05:40",
    "finish": "16:10"
  },
  {
    "duty": "NWHSHUNT20",
    "start": "04:00",
    "finish": "14:30"
  },
  {
    "duty": "NWHSHUNT21",
    "start": "04:30",
    "finish": "15:10"
  },
  {
    "duty": "NWHSHUNT22",
    "start": "12:15",
    "finish": "22:40"
  },
  {
    "duty": "NWHSHUNT23",
    "start": "10:40",
    "finish": "21:10"
  },
  {
    "duty": "NWHSHUNT24",
    "start": "15:10",
    "finish": "23:10"
  },
  {
    "duty": "NWHSHUNT25",
    "start": "14:40",
    "finish": "02:40"
  },
  {
    "duty": "NWHSHUNT26",
    "start": "19:40",
    "finish": "06:40"
  },
  {
    "duty": "NWHSHUNT27",
    "start": "20:40",
    "finish": "05:40"
  },
  {
    "duty": "NWHSHUNT30",
    "start": "20:10",
    "finish": "07:10"
  },
  {
    "duty": "NWHSHUNT31",
    "start": "16:40",
    "finish": "03:10"
  },
  {
    "duty": "NWHSHUNT32",
    "start": "04:00",
    "finish": "13:10"
  },
  {
    "duty": "NWHSHUNT33",
    "start": "05:00",
    "finish": "17:20"
  },
  {
    "duty": "NWHSHUNT34",
    "start": "12:40",
    "finish": "20:40"
  },
  {
    "duty": "NWHSHUNT35",
    "start": "12:40",
    "finish": "22:10"
  },
  {
    "duty": "NWHSHUNT36",
    "start": "14:40",
    "finish": "02:10"
  },
  {
    "duty": "NWHSHUNT37",
    "start": "14:40",
    "finish": "00:10"
  },
  {
    "duty": "NWHSHUNT38",
    "start": "16:40",
    "finish": "05:10"
  },
  {
    "duty": "NWHSHUNT39",
    "start": "20:40",
    "finish": "05:10"
  },
  {
    "duty": "NWHSHUNT40",
    "start": "19:05",
    "finish": "04:10"
  },
  {
    "duty": "NWHSHUNT41Sat",
    "start": "14:25",
    "finish": "23:00"
  },
  {
    "duty": "NWHSHUNT42",
    "start": "01:40",
    "finish": "12:10"
  },
  {
    "duty": "NWHSHUNT43",
    "start": "12:00",
    "finish": "20:00"
  },
  {
    "duty": "TNW1151",
    "start": "09:10",
    "finish": "15:40"
  },
  {
    "duty": "TNW1152",
    "start": "10:10",
    "finish": "17:25"
  },
  {
    "duty": "TNW1153",
    "start": "16:10",
    "finish": "23:25"
  },
  {
    "duty": "TNW1154",
    "start": "09:10",
    "finish": "17:25"
  },
  {
    "duty": "TNW1155",
    "start": "11:10",
    "finish": "14:25"
  },
  {
    "duty": "TNW2156S",
    "start": "18:00",
    "finish": "02:30"
  },
  {
    "duty": "TNW2297",
    "start": "18:05",
    "finish": "03:20"
  },
  {
    "duty": "TNW3032",
    "start": "15:55",
    "finish": "01:35"
  },
  {
    "duty": "TNW3034SAT",
    "start": "00:15",
    "finish": "09:35"
  },
  {
    "duty": "TNW3040",
    "start": "09:30",
    "finish": "17:45"
  },
  {
    "duty": "TNW3041",
    "start": "17:10",
    "finish": "23:55"
  },
  {
    "duty": "TNW3114",
    "start": "12:00",
    "finish": "20:00"
  },
  {
    "duty": "TNW5291",
    "start": "20:35",
    "finish": "06:55"
  },
  {
    "duty": "TNW5291A",
    "start": "18:05",
    "finish": "03:20"
  },
  {
    "duty": "TNW5303",
    "start": "04:00",
    "finish": "11:50"
  },
  {
    "duty": "TNW6016",
    "start": "14:10",
    "finish": "01:15"
  },
  {
    "duty": "TNW6042",
    "start": "09:00",
    "finish": "20:15"
  },
  {
    "duty": "TNW6945",
    "start": "20:30",
    "finish": "06:10"
  },
  {
    "duty": "TNW7022",
    "start": "10:55",
    "finish": "18:40"
  },
  {
    "duty": "TNW7033",
    "start": "08:30",
    "finish": "18:40"
  },
  {
    "duty": "TNW7039",
    "start": "02:00",
    "finish": "09:40"
  },
  {
    "duty": "TNW7045SAT",
    "start": "18:05",
    "finish": "04:05"
  },
  {
    "duty": "TNW7047A",
    "start": "17:05",
    "finish": "02:20"
  },
  {
    "duty": "TNW7069",
    "start": "14:20",
    "finish": "02:10"
  },
  {
    "duty": "TNW7071",
    "start": "06:00",
    "finish": "09:40"
  },
  {
    "duty": "TNW8213",
    "start": "22:50",
    "finish": "07:00"
  },
  {
    "duty": "TNW9045",
    "start": "12:40",
    "finish": "16:25"
  },
  {
    "duty": "TNWAMZ012",
    "start": "10:25",
    "finish": "14:00"
  },
  {
    "duty": "TNWAMZ03",
    "start": "11:35",
    "finish": "23:25"
  },
  {
    "duty": "TNWAMZ04",
    "start": "12:25",
    "finish": "16:00"
  },
  {
    "duty": "TNWASK01",
    "start": "08:25",
    "finish": "12:25"
  },
  {
    "duty": "TNWCLUB01",
    "start": "15:25",
    "finish": "19:30"
  },
  {
    "duty": "TNWDEM01",
    "start": "10:40",
    "finish": "19:40"
  },
  {
    "duty": "TNWGUS01",
    "start": "07:35",
    "finish": "18:05"
  },
  {
    "duty": "TNWGUS02",
    "start": "07:35",
    "finish": "18:05"
  },
  {
    "duty": "TNWHIVE02",
    "start": "09:10",
    "finish": "18:40"
  },
  {
    "duty": "TNWJDSPL05",
    "start": "05:10",
    "finish": "09:15"
  },
  {
    "duty": "TNWJDSPL07",
    "start": "13:10",
    "finish": "17:15"
  },
  {
    "duty": "TNWPET02",
    "start": "10:55",
    "finish": "20:00"
  },
  {
    "duty": "TNWTIK01",
    "start": "14:40",
    "finish": "01:35"
  },
  {
    "duty": "CONNWH3044",
    "start": "15:10",
    "finish": "01:10"
  },
  {
    "duty": "CONNWH3049",
    "start": "16:40",
    "finish": "03:35"
  },
  {
    "duty": "CONNWH3154A",
    "start": "15:15",
    "finish": "01:55"
  },
  {
    "duty": "CONNWH3155",
    "start": "20:55",
    "finish": "09:00"
  },
  {
    "duty": "CONNWH3155F",
    "start": "20:55",
    "finish": "06:10"
  },
  {
    "duty": "CONNWH3271",
    "start": "18:55",
    "finish": "06:10"
  },
  {
    "duty": "CONWA3179A",
    "start": "00:05",
    "finish": "08:30"
  },
  {
    "duty": "CONWA3180B",
    "start": "08:05",
    "finish": "20:00"
  },
  {
    "duty": "CONWA3181",
    "start": "09:25",
    "finish": "17:45"
  },
  {
    "duty": "CONWA3227",
    "start": "07:25",
    "finish": "16:15"
  },
  {
    "duty": "CONWA3255",
    "start": "09:20",
    "finish": "18:35"
  },
  {
    "duty": "CONWA3272",
    "start": "22:40",
    "finish": "08:25"
  },
  {
    "duty": "CONWAV3118",
    "start": "13:00",
    "finish": "22:20"
  },
  {
    "duty": "NEWCONWAV01",
    "start": "14:55",
    "finish": "01:20"
  },
  {
    "duty": "NWHSHUNT41",
    "start": "15:40",
    "finish": "04:10"
  },
  {
    "duty": "TNW1214",
    "start": "07:40",
    "finish": "16:10"
  },
  {
    "duty": "TNW12144",
    "start": "04:55",
    "finish": "12:30"
  },
  {
    "duty": "TNW12144A",
    "start": "03:55",
    "finish": "12:30"
  },
  {
    "duty": "TNW1215",
    "start": "07:40",
    "finish": "15:20"
  },
  {
    "duty": "TNW1217",
    "start": "03:40",
    "finish": "12:10"
  },
  {
    "duty": "TNW1218",
    "start": "04:40",
    "finish": "12:20"
  },
  {
    "duty": "TNW2156",
    "start": "13:25",
    "finish": "02:30"
  },
  {
    "duty": "TNW2159",
    "start": "11:00",
    "finish": "19:30"
  },
  {
    "duty": "TNW3009",
    "start": "12:25",
    "finish": "16:30"
  },
  {
    "duty": "TNW3009A",
    "start": "05:40",
    "finish": "16:25"
  },
  {
    "duty": "TNW3012",
    "start": "11:30",
    "finish": "19:25"
  },
  {
    "duty": "TNW3018",
    "start": "11:10",
    "finish": "20:05"
  },
  {
    "duty": "TNW3034",
    "start": "00:10",
    "finish": "10:10"
  },
  {
    "duty": "TNW3045",
    "start": "08:55",
    "finish": "18:30"
  },
  {
    "duty": "TNW3111",
    "start": "18:00",
    "finish": "02:00"
  },
  {
    "duty": "TNW3112",
    "start": "05:00",
    "finish": "13:00"
  },
  {
    "duty": "TNW3255",
    "start": "10:10",
    "finish": "17:50"
  },
  {
    "duty": "TNW5301",
    "start": "03:25",
    "finish": "11:50"
  },
  {
    "duty": "TNW5315A",
    "start": "16:10",
    "finish": "02:10"
  },
  {
    "duty": "TNW6024",
    "start": "11:55",
    "finish": "19:40"
  },
  {
    "duty": "TNW6040",
    "start": "14:10",
    "finish": "01:15"
  },
  {
    "duty": "TNW6041",
    "start": "14:05",
    "finish": "01:15"
  },
  {
    "duty": "TNW7034",
    "start": "18:55",
    "finish": "01:30"
  },
  {
    "duty": "TNW7035",
    "start": "19:55",
    "finish": "00:25"
  },
  {
    "duty": "TNW7044",
    "start": "06:00",
    "finish": "09:45"
  },
  {
    "duty": "TNW7045",
    "start": "18:05",
    "finish": "04:05"
  },
  {
    "duty": "TNW7046",
    "start": "18:05",
    "finish": "04:05"
  },
  {
    "duty": "TNW7047",
    "start": "17:05",
    "finish": "02:20"
  },
  {
    "duty": "TNWAMZ01A",
    "start": "16:05",
    "finish": "00:15"
  },
  {
    "duty": "TNWAMZ02",
    "start": "08:05",
    "finish": "19:05"
  },
  {
    "duty": "TNWAMZ06",
    "start": "11:00",
    "finish": "19:15"
  },
  {
    "duty": "TNWAMZ07",
    "start": "13:35",
    "finish": "17:05"
  },
  {
    "duty": "TNWAMZ09",
    "start": "21:50",
    "finish": "02:10"
  },
  {
    "duty": "TNWAMZ13",
    "start": "20:55",
    "finish": "23:55"
  },
  {
    "duty": "TNWHMHE02",
    "start": "06:40",
    "finish": "14:55"
  },
  {
    "duty": "TNWHMHE03",
    "start": "11:15",
    "finish": "19:30"
  },
  {
    "duty": "TNWJDSPL04",
    "start": "05:10",
    "finish": "09:20"
  },
  {
    "duty": "TNWJDSPL06",
    "start": "13:10",
    "finish": "17:20"
  },
  {
    "duty": "TNWMDA01",
    "start": "10:55",
    "finish": "19:45"
  },
  {
    "duty": "TNWPET01",
    "start": "10:55",
    "finish": "20:05"
  },
  {
    "duty": "TNWTIK07",
    "start": "14:25",
    "finish": "23:00"
  },
  {
    "duty": "TNWVE01",
    "start": "15:55",
    "finish": "00:45"
  },
  {
    "duty": "TNWVE02",
    "start": "11:55",
    "finish": "20:45"
  },
  {
    "duty": "WAVOC016",
    "start": "03:30",
    "finish": "13:05"
  },
  {
    "duty": "WAVOC023",
    "start": "05:15",
    "finish": "13:40"
  },
  {
    "duty": "WAVOC026A",
    "start": "05:45",
    "finish": "16:30"
  },
  {
    "duty": "WAVOC026B",
    "start": "05:35",
    "finish": "16:00"
  },
  {
    "duty": "WAVOC028",
    "start": "07:15",
    "finish": "14:30"
  },
  {
    "duty": "WAVOC029A",
    "start": "11:45",
    "finish": "19:55"
  },
  {
    "duty": "WAVOC029B",
    "start": "11:45",
    "finish": "19:55"
  },
  {
    "duty": "WAVOC031",
    "start": "07:25",
    "finish": "15:50"
  },
  {
    "duty": "WAVOC033",
    "start": "04:45",
    "finish": "14:00"
  },
  {
    "duty": "WAVOC206",
    "start": "04:40",
    "finish": "13:10"
  },
  {
    "duty": "WAVOC210",
    "start": "06:15",
    "finish": "16:50"
  },
  {
    "duty": "WAVOC211",
    "start": "06:15",
    "finish": "18:20"
  },
  {
    "duty": "WAVOC212",
    "start": "06:25",
    "finish": "16:30"
  },
  {
    "duty": "WAVOC213",
    "start": "06:30",
    "finish": "18:30"
  },
  {
    "duty": "WAVOC215",
    "start": "07:00",
    "finish": "17:55"
  },
  {
    "duty": "WAVOC216",
    "start": "06:45",
    "finish": "17:30"
  },
  {
    "duty": "WAVOC218",
    "start": "06:20",
    "finish": "18:50"
  },
  {
    "duty": "WAVOC224",
    "start": "07:32",
    "finish": "18:02"
  },
  {
    "duty": "WAVOC225",
    "start": "07:45",
    "finish": "16:30"
  },
  {
    "duty": "WAVOC227",
    "start": "06:10",
    "finish": "18:05"
  },
  {
    "duty": "WAVOC229",
    "start": "08:35",
    "finish": "19:20"
  },
  {
    "duty": "WAVOC234",
    "start": "09:00",
    "finish": "19:35"
  },
  {
    "duty": "WAVOC239",
    "start": "09:55",
    "finish": "19:10"
  },
  {
    "duty": "WAVOC240",
    "start": "10:00",
    "finish": "21:20"
  },
  {
    "duty": "WAVOC241",
    "start": "10:00",
    "finish": "20:45"
  },
  {
    "duty": "WAVOC246",
    "start": "11:00",
    "finish": "21:55"
  },
  {
    "duty": "WAVOC247",
    "start": "11:00",
    "finish": "19:40"
  },
  {
    "duty": "WAVOC248",
    "start": "11:05",
    "finish": "21:35"
  },
  {
    "duty": "WAVOC251",
    "start": "11:20",
    "finish": "23:30"
  },
  {
    "duty": "WAVOC252",
    "start": "11:25",
    "finish": "21:40"
  },
  {
    "duty": "WAVOC255",
    "start": "12:05",
    "finish": "21:50"
  },
  {
    "duty": "WAVOC257",
    "start": "09:00",
    "finish": "19:50"
  },
  {
    "duty": "WAVOC259",
    "start": "13:10",
    "finish": "23:15"
  },
  {
    "duty": "WAVOC260",
    "start": "08:05",
    "finish": "20:05"
  },
  {
    "duty": "WAVOC261",
    "start": "09:50",
    "finish": "19:45"
  },
  {
    "duty": "WAVOC262",
    "start": "09:50",
    "finish": "21:00"
  },
  {
    "duty": "WAVOC404",
    "start": "12:10",
    "finish": "22:45"
  },
  {
    "duty": "WAVOC407",
    "start": "12:15",
    "finish": "23:20"
  },
  {
    "duty": "WAVOC408",
    "start": "12:25",
    "finish": "22:35"
  },
  {
    "duty": "WAVOC414",
    "start": "12:00",
    "finish": "20:15"
  },
  {
    "duty": "WAVOC414A",
    "start": "12:00",
    "finish": "20:15"
  },
  {
    "duty": "WAVOC416",
    "start": "12:55",
    "finish": "21:50"
  },
  {
    "duty": "WAVOC417",
    "start": "13:00",
    "finish": "21:15"
  },
  {
    "duty": "WAVOC420",
    "start": "13:15",
    "finish": "21:15"
  },
  {
    "duty": "WAVOC423B",
    "start": "10:20",
    "finish": "18:50"
  },
  {
    "duty": "WAVOC424",
    "start": "13:25",
    "finish": "23:05"
  },
  {
    "duty": "WAVOC427",
    "start": "13:54",
    "finish": "01:30"
  },
  {
    "duty": "WAVOC429",
    "start": "13:55",
    "finish": "02:25"
  },
  {
    "duty": "WAVOC442A",
    "start": "15:15",
    "finish": "02:15"
  },
  {
    "duty": "WAVOC442B",
    "start": "15:15",
    "finish": "02:15"
  },
  {
    "duty": "WAVOC444",
    "start": "15:00",
    "finish": "02:10"
  },
  {
    "duty": "WAVOC448",
    "start": "15:20",
    "finish": "23:30"
  },
  {
    "duty": "WAVOC455",
    "start": "15:40",
    "finish": "03:20"
  },
  {
    "duty": "WAVOC462A",
    "start": "15:55",
    "finish": "23:10"
  },
  {
    "duty": "WAVOC462B",
    "start": "15:55",
    "finish": "21:55"
  },
  {
    "duty": "WAVOC466",
    "start": "16:10",
    "finish": "02:00"
  },
  {
    "duty": "WAVOC469",
    "start": "16:00",
    "finish": "02:00"
  },
  {
    "duty": "WAVOC471",
    "start": "16:35",
    "finish": "03:15"
  },
  {
    "duty": "WAVOC472",
    "start": "16:35",
    "finish": "02:08"
  },
  {
    "duty": "WAVOC472A",
    "start": "16:35",
    "finish": "02:08"
  },
  {
    "duty": "WAVOC474",
    "start": "16:15",
    "finish": "01:25"
  },
  {
    "duty": "WAVOC478",
    "start": "16:55",
    "finish": "02:00"
  },
  {
    "duty": "WAVOC479",
    "start": "16:55",
    "finish": "01:35"
  },
  {
    "duty": "WAVOC480",
    "start": "16:30",
    "finish": "02:00"
  },
  {
    "duty": "WAVOC487",
    "start": "19:40",
    "finish": "03:40"
  },
  {
    "duty": "WAVOC488",
    "start": "16:05",
    "finish": "04:10"
  },
  {
    "duty": "WAVOC490",
    "start": "10:25",
    "finish": "19:30"
  },
  {
    "duty": "WAVOC494",
    "start": "13:55",
    "finish": "00:45"
  },
  {
    "duty": "WAVOC495",
    "start": "12:45",
    "finish": "23:30"
  },
  {
    "duty": "WAVOC496",
    "start": "12:10",
    "finish": "22:00"
  },
  {
    "duty": "WAVOC497",
    "start": "16:10",
    "finish": "01:30"
  },
  {
    "duty": "WAVOC498",
    "start": "13:10",
    "finish": "00:10"
  },
  {
    "duty": "WAVOC499",
    "start": "12:55",
    "finish": "00:00"
  },
  {
    "duty": "WAVOC501",
    "start": "13:40",
    "finish": "01:25"
  },
  {
    "duty": "WAVOC502",
    "start": "15:55",
    "finish": "01:45"
  },
  {
    "duty": "WAVOC604",
    "start": "18:10",
    "finish": "05:10"
  },
  {
    "duty": "WAVOC606",
    "start": "14:30",
    "finish": "23:00"
  },
  {
    "duty": "WAVOC607",
    "start": "18:25",
    "finish": "06:21"
  },
  {
    "duty": "WAVOC609",
    "start": "18:40",
    "finish": "05:31"
  },
  {
    "duty": "WAVOC611",
    "start": "19:40",
    "finish": "05:25"
  },
  {
    "duty": "WAVOC615",
    "start": "19:00",
    "finish": "07:00"
  },
  {
    "duty": "WAVOC619",
    "start": "20:30",
    "finish": "05:10"
  },
  {
    "duty": "WAVOC620",
    "start": "20:30",
    "finish": "08:30"
  },
  {
    "duty": "WAVOC621",
    "start": "20:40",
    "finish": "05:30"
  },
  {
    "duty": "WAVOC625",
    "start": "20:45",
    "finish": "07:30"
  },
  {
    "duty": "WAVOC626",
    "start": "20:50",
    "finish": "08:00"
  },
  {
    "duty": "WAVOC632",
    "start": "21:30",
    "finish": "06:55"
  },
  {
    "duty": "WAVOC637",
    "start": "22:00",
    "finish": "07:45"
  },
  {
    "duty": "WAVOC639",
    "start": "22:10",
    "finish": "08:05"
  },
  {
    "duty": "WAVOC641",
    "start": "17:00",
    "finish": "06:35"
  },
  {
    "duty": "WAVOC646",
    "start": "22:50",
    "finish": "09:15"
  },
  {
    "duty": "WAVOC647",
    "start": "23:25",
    "finish": "09:10"
  },
  {
    "duty": "WAVOC652",
    "start": "19:40",
    "finish": "06:50"
  },
  {
    "duty": "WAVOC653",
    "start": "20:10",
    "finish": "05:50"
  },
  {
    "duty": "WAVOC654",
    "start": "19:40",
    "finish": "04:07"
  },
  {
    "duty": "WAVOC656",
    "start": "18:55",
    "finish": "04:45"
  },
  {
    "duty": "WAVOC657",
    "start": "18:55",
    "finish": "05:45"
  },
  {
    "duty": "WAVOC658",
    "start": "18:00",
    "finish": "02:50"
  },
  {
    "duty": "WAVOC659",
    "start": "22:50",
    "finish": "08:50"
  },
  {
    "duty": "WAVOC660",
    "start": "22:50",
    "finish": "09:15"
  },
  {
    "duty": "WAVOC661",
    "start": "18:30",
    "finish": "06:20"
  },
  {
    "duty": "WAVOC662",
    "start": "19:55",
    "finish": "06:00"
  },
  {
    "duty": "WAVOC802",
    "start": "00:48",
    "finish": "12:21"
  },
  {
    "duty": "WAVOC807",
    "start": "01:30",
    "finish": "09:30"
  },
  {
    "duty": "WAVOC809",
    "start": "00:10",
    "finish": "09:55"
  },
  {
    "duty": "WAVOC814",
    "start": "05:20",
    "finish": "15:30"
  },
  {
    "duty": "WAVOC815",
    "start": "04:50",
    "finish": "14:35"
  },
  {
    "duty": "WAVOC816",
    "start": "04:55",
    "finish": "13:50"
  },
  {
    "duty": "WAVOC819",
    "start": "05:15",
    "finish": "16:20"
  },
  {
    "duty": "WAVOC826",
    "start": "06:25",
    "finish": "15:40"
  },
  {
    "duty": "WAVOC828",
    "start": "06:30",
    "finish": "16:30"
  },
  {
    "duty": "WAVOC834",
    "start": "07:10",
    "finish": "17:30"
  },
  {
    "duty": "WAVOC835",
    "start": "07:50",
    "finish": "19:21"
  },
  {
    "duty": "WAVOC837",
    "start": "08:55",
    "finish": "17:40"
  },
  {
    "duty": "WAVOC840",
    "start": "09:00",
    "finish": "17:48"
  },
  {
    "duty": "WAVOC842",
    "start": "06:40",
    "finish": "15:30"
  },
  {
    "duty": "WAVOC846",
    "start": "11:05",
    "finish": "20:20"
  },
  {
    "duty": "WAVOC847",
    "start": "09:25",
    "finish": "19:50"
  },
  {
    "duty": "WAVOC855",
    "start": "12:25",
    "finish": "21:00"
  },
  {
    "duty": "WAVOC8834",
    "start": "12:10",
    "finish": "22:00"
  }
];

const dutyOptions: DutyOption[] = rawDutyOptions.map((item) => {
  const dutyLocation = item.duty.startsWith("WAVOC") ? "Warrington VOC" : "North West Hub";
  const duration = calculateDutyDuration(item.start, item.finish);

  return {
    ...item,
    startLocation: dutyLocation,
    endLocation: dutyLocation,
    totalTime: duration.label,
    crossesMidnight: duration.crossesMidnight,
  };
});

const dayOptions = ["Mon 29 Jun", "Tue 30 Jun", "Wed 01 Jul", "Thu 02 Jul", "Fri 03 Jul", "Sat 04 Jul", "Sun 05 Jul"];

export default function RhcTeamPage() {
  const [selectedDuty, setSelectedDuty] = useState(() => dutyOptions[0]?.duty ?? "");
  const [selectedDay, setSelectedDay] = useState("Wed 01 Jul");
  const [dutySearch, setDutySearch] = useState("");
  const [sendPortal, setSendPortal] = useState(true);
  const [send318, setSend318] = useState(true);
  const [notes, setNotes] = useState("Order Road Haulage Contractor from LINK duty selection.");
  const [confirmation, setConfirmation] = useState("");

  const duty = useMemo(
    () => dutyOptions.find((item) => item.duty === selectedDuty) ?? dutyOptions[0],
    [selectedDuty],
  );

  const filteredDutyOptions = useMemo(() => {
    const searchText = dutySearch.trim().toLowerCase();

    if (!searchText) {
      return dutyOptions;
    }

    return dutyOptions.filter((item) =>
      item.duty.toLowerCase().includes(searchText) ||
      item.startLocation.toLowerCase().includes(searchText) ||
      item.endLocation.toLowerCase().includes(searchText),
    );
  }, [dutySearch]);

  function chooseDuty(nextDuty: string) {
    setSelectedDuty(nextDuty);
    setConfirmation("");
  }

  function sendMockOrder() {
    const destinations = [sendPortal ? "RHC Portal" : null, send318 ? "318 Data" : null]
      .filter(Boolean)
      .join(" and ");

    setConfirmation(
      `${duty.duty} for ${selectedDay} has been prepared and sent to ${destinations || "the selected output"}. Duty time: ${duty.start} - ${duty.finish} (${duty.totalTime}).`,
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader title="MOCK UP" subtitle="RHC Team" />

      <div className="flex">
        <OfficeSidebar />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <section className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#e40000] text-sm font-black text-white">
                  RHC
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111827]">RHC Team Order Dashboard</h1>
                  <p className="text-sm font-bold text-[#6b7280]">
                    Select a LINK duty and send mock order data to the RHC Portal and 318 Data.
                  </p>
                </div>
              </div>

              <Link
                href="/internal/app-ideas/link-message-mock"
                className="rounded-lg border border-[#ccd5e2] bg-white px-4 py-2 text-sm font-black text-[#4b5563] no-underline transition hover:border-[#e40000]"
              >
                ← Back to Duty Execution
              </Link>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Step 1</p>
              <h2 className="mt-2 text-2xl font-black text-[#111827]">Choose duty and day</h2>

              <label className="mt-5 block">
                <span className="text-sm font-black text-[#111827]">Duty number</span>
                <select
                  value={selectedDuty}
                  onChange={(event) => chooseDuty(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                >
                  {dutyOptions.map((item) => (
                    <option key={item.duty} value={item.duty}>
                      {item.duty} — {item.start} to {item.finish}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-black text-[#111827]">Day</span>
                <select
                  value={selectedDay}
                  onChange={(event) => {
                    setSelectedDay(event.target.value);
                    setConfirmation("");
                  }}
                  className="mt-2 h-12 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                >
                  {dayOptions.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>

              <section className="mt-5 rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-4">
                <p className="text-sm font-black text-[#111827]">Duty timing preview</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MiniTiming label="Start" value={duty.start} />
                  <MiniTiming label="End" value={duty.finish} />
                  <MiniTiming label="Total" value={duty.totalTime} />
                </div>
                {duty.crossesMidnight ? (
                  <p className="mt-3 rounded-md border border-[#f59e0b] bg-[#fff7ed] px-3 py-2 text-xs font-black text-[#92400e]">
                    This duty crosses midnight. The total time has been calculated into the next day.
                  </p>
                ) : null}
              </section>

              <section className="mt-5 rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-4">
                <p className="text-sm font-black text-[#111827]">Send data to</p>
                <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[#374151]">
                  <input checked={sendPortal} onChange={(event) => setSendPortal(event.target.checked)} type="checkbox" className="h-4 w-4" />
                  RHC Portal
                </label>
                <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[#374151]">
                  <input checked={send318} onChange={(event) => setSend318(event.target.checked)} type="checkbox" className="h-4 w-4" />
                  318 Data
                </label>
              </section>

              <label className="mt-4 block">
                <span className="text-sm font-black text-[#111827]">Office notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-[110px] w-full rounded-lg border border-[#ccd5e2] bg-white px-3 py-3 text-sm font-bold text-[#111827] outline-none focus:border-[#e40000]"
                />
              </label>

              <button
                type="button"
                onClick={sendMockOrder}
                className="mt-5 w-full rounded-lg bg-[#e40000] px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#b80000]"
              >
                Send mock RHC order
              </button>

              {confirmation && (
                <section className="mt-4 rounded-lg border-2 border-[#157347] bg-[#ecfdf3] p-4 text-sm font-black leading-6 text-[#157347]">
                  {confirmation}
                </section>
              )}
            </aside>

            <section className="space-y-4">
              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Selected LINK duty</p>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <h2 className="mt-2 text-4xl font-black text-[#111827]">{duty.duty}</h2>
                  <p className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">
                    {duty.duty.startsWith("WAVOC") ? "WAVOC duty" : "North West Hub duty"}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-6">
                  <InfoBox label="Day" value={selectedDay} />
                  <InfoBox label="Starts at" value={duty.startLocation} />
                  <InfoBox label="Ends at" value={duty.endLocation} />
                  <InfoBox label="Start time" value={duty.start} />
                  <InfoBox label="End time" value={duty.finish} />
                  <InfoBox label="Total time" value={duty.totalTime} />
                </div>
              </div>

              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Mock data package</p>
                <h2 className="mt-2 text-2xl font-black text-[#111827]">What would be sent</h2>

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <DataPackageCard
                    title="RHC Portal"
                    enabled={sendPortal}
                    rows={[
                      "Duty ID and operating date",
                      `Start/end location: ${duty.startLocation} to ${duty.endLocation}`,
                      `Planned duty timings: ${duty.start} - ${duty.finish}`,
                      `Calculated total duty time: ${duty.totalTime}`,
                      "Contractor order note",
                    ]}
                  />
                  <DataPackageCard
                    title="318 Data"
                    enabled={send318}
                    rows={[
                      "Duty number and day",
                      `Start time, end time and total duration: ${duty.start} - ${duty.finish} (${duty.totalTime})`,
                      duty.crossesMidnight ? "Overnight duty flag for midnight crossover" : "Same-day duty timing flag",
                      "Trailer and load requirement placeholder",
                      "Office notes for downstream mockup",
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-md border border-[#d9dee6] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Duty picker</p>
                    <p className="mt-2 text-sm font-bold text-[#6b7280]">
                      Search and select from the pasted duty number list.
                    </p>
                  </div>
                  <label className="block lg:w-[340px]">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">Search duty</span>
                    <input
                      value={dutySearch}
                      onChange={(event) => setDutySearch(event.target.value)}
                      placeholder="Example: NWH007 or WAVOC016"
                      className="mt-2 h-11 w-full rounded-lg border border-[#ccd5e2] bg-white px-3 text-sm font-black text-[#111827] outline-none focus:border-[#e40000]"
                    />
                  </label>
                </div>

                <div className="mt-4 max-h-[460px] overflow-y-auto rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredDutyOptions.map((item) => (
                      <button
                        key={item.duty}
                        type="button"
                        onClick={() => chooseDuty(item.duty)}
                        className={`rounded-lg border p-3 text-left transition hover:border-[#e40000] ${
                          selectedDuty === item.duty ? "border-[#e40000] bg-[#fff0f0]" : "border-[#d9dee6] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-[#111827]">{item.duty}</p>
                            <p className="mt-1 text-xs font-bold text-[#6b7280]">{item.startLocation} to {item.endLocation}</p>
                          </div>
                          <span className="rounded-full bg-[#eef2f7] px-2 py-1 text-[11px] font-black text-[#374151]">
                            {item.totalTime}
                          </span>
                        </div>
                        <p className="mt-3 text-xs font-black text-[#374151]">
                          {item.start} → {item.finish}{item.crossesMidnight ? " +1 day" : ""}
                        </p>
                      </button>
                    ))}
                  </div>

                  {filteredDutyOptions.length === 0 ? (
                    <p className="p-4 text-sm font-black text-[#6b7280]">No duty numbers match your search.</p>
                  ) : null}
                </div>
              </div>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
          aria-label="Back to Duty Execution"
        >
          ≡
        </Link>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">{title}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <Link
          href="/internal/app-ideas"
          className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
        >
          ← Back to PDA Home
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
        <div className="hidden text-right sm:block">
          <p className="text-base font-black">Andrew Cannon</p>
          <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
        </div>
      </div>
    </header>
  );
}

function OfficeSidebar() {
  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-[68px] flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${
            item.icon.length > 2 ? "text-sm font-black" : "text-3xl"
          } ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {item.alertCount ? (
            <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
              {item.alertCount}
            </span>
          ) : null}
        </Link>
      ))}
      <button
        type="button"
        className="mt-auto flex h-[64px] items-center justify-center border-t border-white/10 text-3xl text-white/80 transition hover:bg-[#11171d] hover:text-white"
        aria-label="Collapse sidebar"
      >
        »
      </button>
    </aside>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d9dee6] bg-[#f8fafc] p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</p>
      <p className="mt-2 text-sm font-black text-[#111827]">{value}</p>
    </div>
  );
}

function MiniTiming({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d9dee6] bg-white p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#111827]">{value}</p>
    </div>
  );
}

function DataPackageCard({
  title,
  enabled,
  rows,
}: {
  title: string;
  enabled: boolean;
  rows: string[];
}) {
  return (
    <section className={`rounded-lg border p-4 ${enabled ? "border-[#157347] bg-[#ecfdf3]" : "border-[#d9dee6] bg-[#f8fafc] opacity-60"}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-[#111827]">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${enabled ? "bg-[#157347] text-white" : "bg-[#6b7280] text-white"}`}>
          {enabled ? "Selected" : "Off"}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm font-bold text-[#374151]">
        {rows.map((row) => (
          <li key={row} className="flex gap-2">
            <span className="text-[#e40000]">•</span>
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function calculateDutyDuration(start: string, finish: string) {
  const startMinutes = timeToMinutes(start);
  const finishMinutes = timeToMinutes(finish);
  const crossesMidnight = finishMinutes < startMinutes;
  const totalMinutes = (crossesMidnight ? finishMinutes + 24 * 60 : finishMinutes) - startMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    crossesMidnight,
    label: `${hours}h ${String(minutes).padStart(2, "0")}m`,
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
