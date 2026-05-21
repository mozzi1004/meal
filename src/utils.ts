/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the current date shifted to Korea Standard Time (KST, UTC+9).
 * This ensures accurate dates regardless of client system time settings.
 */
export function getTodayKST(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kstOffset = 9 * 3600000; // UTC+9
  return new Date(utc + kstOffset);
}

const DAYS_KOREAN = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const DAYS_SHORT_KOREAN = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Formats a Date object to "M월 D일 요일" (e.g. "5월 15일 금요일")
 */
export function formatKoreanDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${DAYS_KOREAN[date.getDay()]}`;
}

/**
 * Formats a Date to "YYYYMMDD"
 */
export function formatDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Returns Korean short day name (e.g. "월")
 */
export function getKoreanDayOfWeek(date: Date): string {
  return DAYS_SHORT_KOREAN[date.getDay()];
}

/**
 * Returns the array of Date objects for Monday through Friday of the week containing the given date.
 */
export function getWeekDates(date: Date): Date[] {
  const currentDay = date.getDay(); // 0 is Sunday, 1 is Monday ...
  // Calculate difference to Monday. Sunday (0) goes to previous Monday (-6)
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

/**
 * Calculates which week of the month a date belongs to and formats as "M월 N주차" (e.g. "5월 3주차")
 */
export function getWeekOfMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateNum = date.getDate();
  
  // Find the first day of the month
  const firstDay = new Date(year, date.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...
  
  // Convert standard starting offset
  const dayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const weekNum = Math.ceil((dateNum + dayOffset) / 7);
  return `${month}월 ${weekNum}주차`;
}

/**
 * Determines the default selected date.
 * If today is a weekday, returns today KST.
 * If today is Saturday or Sunday (weekend), returns next Monday (Method B).
 */
export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay();
  if (day === 0) { // Sunday -> Next Monday
    const nextMon = new Date(today);
    nextMon.setDate(today.getDate() + 1);
    return nextMon;
  } else if (day === 6) { // Saturday -> Next Monday
    const nextMon = new Date(today);
    nextMon.setDate(today.getDate() + 2);
    return nextMon;
  }
  return today;
}
