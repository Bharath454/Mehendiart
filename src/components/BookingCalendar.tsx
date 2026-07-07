"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  blockedDates: string[]; // List of YYYY-MM-DD
  loadingBlocked: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  blockedDates,
  loadingBlocked,
}: BookingCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  // Calculate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Check if date is in the past
  const isDateInPast = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day);
    const todayCompare = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayCompare;
  };

  // Format date as YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Render Calendar Grid Cells
  const renderCells = () => {
    const cells = [];
    const totalCells = daysInMonth + firstDay;
    const rows = Math.ceil(totalCells / 7);

    let day = 1;

    for (let i = 0; i < rows * 7; i++) {
      if (i < firstDay || day > daysInMonth) {
        cells.push(<div key={`empty-${i}`} className="p-3 text-center text-gray-300" />);
      } else {
        const currentDayNum = day;
        const dateStr = formatDateString(currentYear, currentMonth, currentDayNum);
        const isPast = isDateInPast(currentYear, currentMonth, currentDayNum);
        const isBlocked = blockedDates.includes(dateStr);
        const isSelected = selectedDate === dateStr;
        const isSunday = (i % 7) === 0;

        let cellClass = "p-3 text-center rounded-xl text-sm font-medium transition-all duration-200 relative cursor-pointer ";
        let dotIndicator = null;

        if (isPast) {
          cellClass += "text-gray-300 cursor-not-allowed pointer-events-none";
        } else if (isBlocked) {
          cellClass += "text-red-400 bg-red-50/40 line-through cursor-not-allowed pointer-events-none";
          dotIndicator = <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-400" />;
        } else if (isSelected) {
          cellClass += "bg-mehendi-dark text-mehendi-cream font-bold shadow-md ring-2 ring-mehendi-gold/40";
        } else {
          cellClass += "hover:bg-mehendi-gold/10 text-mehendi-darker ";
          if (isSunday) {
            cellClass += "text-mehendi-gold font-semibold";
          }
        }

        cells.push(
          <div
            key={`day-${currentDayNum}`}
            onClick={() => !isPast && !isBlocked && onSelectDate(dateStr)}
            className={cellClass}
          >
            <span>{currentDayNum}</span>
            {dotIndicator}
          </div>
        );
        day++;
      }
    }
    return cells;
  };

  // Disable navigating back before today's month
  const isPrevDisabled = currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  return (
    <div className="bg-white border border-mehendi-gold/20 rounded-2xl p-5 shadow-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-mehendi-gold/10 pb-4 mb-4">
        <h4 className="font-serif font-bold text-mehendi-dark text-lg flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-mehendi-gold shrink-0" />
          <span>{MONTHS[currentMonth]} {currentYear}</span>
        </h4>
        
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            className={`p-2 rounded-lg border border-mehendi-gold/10 text-mehendi-dark hover:bg-mehendi-gold/5 focus:outline-none transition-colors ${
              isPrevDisabled ? "opacity-35 cursor-not-allowed pointer-events-none" : ""
            }`}
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-mehendi-gold/10 text-mehendi-dark hover:bg-mehendi-gold/5 focus:outline-none transition-colors"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-semibold uppercase tracking-wider py-1.5 text-mehendi-olive/80 ${
              idx === 0 ? "text-mehendi-gold" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid Cells */}
      <div className="relative">
        {loadingBlocked && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
            <Loader2 className="h-8 w-8 text-mehendi-gold animate-spin" />
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {renderCells()}
        </div>
      </div>

      {/* Calendar Legend Info */}
      <div className="flex items-center justify-between border-t border-mehendi-gold/10 mt-5 pt-3.5 text-xs text-mehendi-olive/80 font-light">
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-mehendi-dark shrink-0" />
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-white border border-mehendi-gold/20 shrink-0" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-50 text-red-400 border border-red-100 flex items-center justify-center shrink-0 text-[10px] line-through font-bold">1</span>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
}
