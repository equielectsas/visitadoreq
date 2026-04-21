"use client";

import { useState, useEffect } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [days, setDays] = useState([]);
  const [blanks, setBlanks] = useState([]);

  useEffect(() => {
    generateCalendar();
  }, [month, year]);

  const generateCalendar = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    let blanksArray = [];
    for (let i = 0; i < startDay; i++) blanksArray.push(i);

    let daysArray = [];
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

    setBlanks(blanksArray);
    setDays(daysArray);
  };

  const isToday = (day) => {
    const d = new Date(year, month, day);
    return d.toDateString() === new Date().toDateString();
  };

  return (
    <LayoutDashboard>

      <h1 className="text-3xl pb-6">Calendar</h1>

      <div className="bg-white rounded shadow overflow-hidden">

        {/* HEADER CALENDAR */}
        <div className="flex justify-between items-center px-6 py-3">
          <div>
            <span className="text-lg font-bold">
              {MONTH_NAMES[month]}
            </span>
            <span className="ml-2 text-gray-600">{year}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => month > 0 && setMonth(month - 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              ◀
            </button>

            <button
              onClick={() => month < 11 && setMonth(month + 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              ▶
            </button>
          </div>
        </div>

        {/* DAYS HEADER */}
        <div className="grid grid-cols-7 text-center font-bold text-gray-600">
          {DAYS.map((d, i) => (
            <div key={i} className="py-2">{d}</div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7">

          {blanks.map((_, i) => (
            <div key={i} className="h-24 border" />
          ))}

          {days.map((d, i) => (
            <div key={i} className="h-24 border p-2">
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday(d)
                    ? "bg-[var(--color-primary)] text-black"
                    : "hover:bg-gray-200"
                }`}
              >
                {d}
              </div>
            </div>
          ))}

        </div>

      </div>

    </LayoutDashboard>
  );
}