/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TabType, MealData, StudentProfile } from './types';
import {
  getTodayKST,
  formatKoreanDate,
  formatDateKey,
  getKoreanDayOfWeek,
  getWeekDates,
  getWeekOfMonth,
  getDefaultSelectedDate
} from './utils';
import { generateMealBatchForWeekDates, getDishMacro } from './data';

export default function App() {
  // 1. App State & Dynamic Dates
  const [today, setToday] = useState<Date>(() => getTodayKST());
  
  // Calculate dynamic weekly dates (Monday to Friday) based on the active KST day
  const weekDates = useMemo(() => getWeekDates(today), [today]);
  
  // Create mock meal database for Monday-Friday of the active week
  const weeklyMeals = useMemo(() => generateMealBatchForWeekDates(weekDates), [weekDates]);

  // Handle weekend redirection (Method B)
  // If today is Sunday or Saturday, the default selected date becomes the next Monday
  const defaultSelectedDate = useMemo(() => getDefaultSelectedDate(today), [today]);
  const isWeekendActive = useMemo(() => today.getDay() === 0 || today.getDay() === 6, [today]);

  // Current selected date in the weekly menu panel (defaults to the weekday or next Monday)
  const [selectedDate, setSelectedDate] = useState<Date>(defaultSelectedDate);

  // Active view tab state ('home' | 'meals' | 'calc' | 'profile')
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Sync selectedDate with defaultSelectedDate when today changes
  useEffect(() => {
    setSelectedDate(defaultSelectedDate);
  }, [defaultSelectedDate]);

  // 2. Student Profile State (defaults match Profile mockup)
  const [profile, setProfile] = useState<StudentProfile>({
    name: '김학생',
    gradeClass: '2학년 3반 15번',
    allergies: ['우유', '땅콩'],
    allergyAlertEnabled: true,
    dailyAlertEnabled: true,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Ukd7McC-CIY1FQpfE-N0B365-ZipVrDa-2Xgf2IyA3BVgiQiRc-lEUu_hYaWEfLCF18LC9V0CwZfMCyF_SywCIUQx5Fxg8Ce_Hzyb3biz_4CzRikj4v4Jy_ssEvioDs50A7ftQyC3ynVEPsnd1ylx_msXKswsmG2nI9gK1R5zppYHKaTTMOTk2-JqHDtHkmdZ4xXLxK4Z0gYwwVLcXJpitPSpaj6161WIJdq9VPDzM4FwK07w3OxnaCHmq0tNKwTpNpgT1dpHC8'
  });

  // Modal control states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editGrade, setEditGrade] = useState(profile.gradeClass);
  const [customAllergen, setCustomAllergen] = useState('');

  // 3. Nutrition Calculator Selection State
  // Initializes to the selectedDate's lunch dishes list of mock-selected checkboxes
  const lunchKey = formatDateKey(selectedDate);
  const activeDayLunch = useMemo(() => {
    return weeklyMeals.find(m => m.dateKey === lunchKey && m.mealType === 'lunch');
  }, [weeklyMeals, lunchKey]);

  const [calcSelectedDishes, setCalcSelectedDishes] = useState<string[]>([]);
  const [calcFilter, setCalcFilter] = useState<'all' | 'rice' | 'soup' | 'side' | 'dessert'>('all');

  // Triggered when selectedDate changes or calculator views are toggled
  useEffect(() => {
    if (activeDayLunch) {
      // By default select all items from the lunch dataset
      setCalcSelectedDishes(activeDayLunch.dishes);
    }
  }, [activeDayLunch]);

  // Cumulative calculated macros
  const calcTotals = useMemo(() => {
    let kcal = 0;
    let protein = 0;
    let carb = 0;
    let fat = 0;
    
    calcSelectedDishes.forEach(dish => {
      const stats = getDishMacro(dish);
      kcal += stats.kcal;
      protein += stats.protein;
      carb += stats.carb;
      fat += stats.fat;
    });

    return { kcal, protein, carb, fat };
  }, [calcSelectedDishes]);

  // Handle Calculator check/uncheck
  const toggleCalcDish = (dish: string) => {
    setCalcSelectedDishes(prev => {
      if (prev.includes(dish)) {
        return prev.filter(d => d !== dish);
      } else {
        return [...prev, dish];
      }
    });
  };

  // Profile management handoffs
  const saveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editName,
      gradeClass: editGrade
    }));
    setIsProfileModalOpen(false);
  };

  const toggleAllergyPreference = (allergy: string) => {
    setProfile(prev => {
      const allergies = prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy];
      return { ...prev, allergies };
    });
  };

  const addCustomAllergies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAllergen.trim()) return;
    if (!profile.allergies.includes(customAllergen.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, customAllergen.trim()]
      }));
    }
    setCustomAllergen('');
  };

  // Checks if a meal contains any ingredients flagged in the student's allergy profile
  const getIngredientAllergyWarnings = (meal: MealData | undefined) => {
    if (!meal || !profile.allergyAlertEnabled) return [];
    return meal.allergens.filter(allergy => profile.allergies.includes(allergy));
  };

  // Extract selected meal data corresponding to the active Date context
  const currentLunch = useMemo(() => {
    return weeklyMeals.find(m => m.dateKey === formatDateKey(selectedDate) && m.mealType === 'lunch');
  }, [weeklyMeals, selectedDate]);

  const currentDinner = useMemo(() => {
    return weeklyMeals.find(m => m.dateKey === formatDateKey(selectedDate) && m.mealType === 'dinner');
  }, [weeklyMeals, selectedDate]);

  return (
    <div className="bg-[#fff8f3] text-[#201b11] min-h-screen pb-28 font-sans transition-colors duration-300 w-full flex flex-col items-center">
      
      {/* 1. App Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full max-w-[420px] shadow-sm border-b border-[#f8ecdc]">
        <div className="flex justify-between items-center px-5 h-16">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('home')}
              className="text-[#3c5500] hover:bg-[#f3e6d7] p-2 rounded-full transition-all active:scale-95 flex items-center justify-center"
              aria-label="Home"
            >
              <span className="material-symbols-outlined text-[24px]">restaurant</span>
            </button>
            <h1 className="text-xl font-bold text-[#201b11] tracking-tight">씨마스고등학교 급식</h1>
          </div>
          
          <button 
            className="text-[#444939] hover:bg-[#f3e6d7] p-2 rounded-full transition-all active:scale-95 relative flex items-center justify-center"
            aria-label="Notifications"
            onClick={() => alert('신선한 오늘 급식이 조리실에서 출발할 에정입니다!')}
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
          </button>
        </div>
      </header>

      {/* 2. Primary Layout views */}
      <main className="w-full max-w-[420px] px-5 pt-5 pb-8 flex-grow flex flex-col gap-6">
        
        {/* VIEW A: HOME SCREEN */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Today's Recommendation Hero Card */}
            <section className="glass-card rounded-[24px] overflow-hidden relative shadow-md">
              <div className="h-52 w-full relative">
                <img 
                  alt="치즈돈까스 정식" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWLR7mQAf8mOxeNCp-pmzksRwqtXKGW39RCBvINJWg-BLkQhk7uMcLjVsA0IiK-fGAB6qfVw0FH7LJGGIGbH-VvTzY-QMMDLEOlc92vpMmaYpUQJN_BOctAZLXnBkefadaRog63bJEpLz2bsK_wocy22UnDuP2zOkuviEDi5SxhZWl-NOXfy_nPRYPdtEvWRoTRQ8AR58iyuYbpP_MkZtW0Da1fySByt6Cly8RBygO6eP1CbLWA73z2uMhrDQqIEzpzgB-BNpXQW4"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute top-4 left-4 bg-[#3c5500] text-white font-semibold text-xs px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] fill">star</span> 오늘의 추천 급식
                </div>

                {isWeekendActive && (
                  <div className="absolute top-4 right-4 bg-[#ba1a1a] text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    다음 급식일
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-[#3c5500]">
                    {formatKoreanDate(selectedDate)}
                  </p>
                  {isWeekendActive && (
                    <span className="text-xs text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full font-medium">
                      주말 우회 자동 노출
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-2xl font-extrabold text-[#201b11] leading-none">
                    {currentLunch?.title || "치즈돈까스 정식"}
                  </h2>
                  <span className="text-xs font-semibold text-[#536500] bg-[#d2ea7a] px-2.5 py-1 rounded-md">
                    {currentLunch?.totalCalories || 845} kcal
                  </span>
                </div>
                
                <p className="text-sm text-[#444939] leading-relaxed">
                  바삭한 튀김옷 속에 가득 흘러내리는 고소한 치즈가 일품인 명품 특식 정단입니다.
                </p>

                {/* Allergen Alerts inside Home Hero */}
                {profile.allergyAlertEnabled && currentLunch && getIngredientAllergyWarnings(currentLunch).length > 0 && (
                  <div className="mt-3.5 bg-[#ffdad6] text-[#93000a] p-3 rounded-xl flex items-center gap-2 text-xs font-medium">
                    <span className="material-symbols-outlined text-base text-[#ba1a1a]">warning</span>
                    <span>경고: 내 알레르기 유발 물질 포함 <strong>({getIngredientAllergyWarnings(currentLunch).join(', ')})</strong></span>
                  </div>
                )}
              </div>
            </section>

            {/* Daily Summary Overview cards */}
            <section className="flex flex-col gap-3">
              <h3 className="font-bold text-lg text-[#201b11] px-1">오늘의 급식 요약</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8ecdc] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-[#ede1d1]/50">
                  <span className="material-symbols-outlined text-[#3c5500] text-3xl mb-1.5">wb_sunny</span>
                  <span className="text-[11px] font-semibold text-[#444939]">중식 배식 시간</span>
                  <span className="text-sm font-bold text-[#201b11] mt-0.5">11:30 - 13:00</span>
                </div>
                <div className="bg-[#f8ecdc] rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-[#ede1d1]/50">
                  <span className="material-symbols-outlined text-[#536500] text-3xl mb-1.5">dark_mode</span>
                  <span className="text-[11px] font-semibold text-[#444939]">석식 배식 시간</span>
                  <span className="text-sm font-bold text-[#201b11] mt-0.5">17:30 - 18:30</span>
                </div>
              </div>
            </section>

            {/* Expanded Lunch Card view */}
            <section className="bg-white rounded-3xl p-5 shadow-[0px_10px_30px_rgba(79,111,0,0.04)] border border-[#ede1d1]/40 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#f8ecdc] pb-3 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#c9f07c]/40 flex items-center justify-center text-[#3c5500]">
                    <span className="material-symbols-outlined text-lg">restaurant</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#201b11]">중식 식단</h3>
                </div>
                <span className="text-xs font-semibold text-[#3c5500] bg-[#c9f17c] px-3 py-1 rounded-full">
                  {currentLunch?.totalCalories || 845} kcal
                </span>
              </div>
              
              <ul className="space-y-2.5">
                {currentLunch?.dishes.map((dish, idx) => {
                  const isMain = idx === 2; // Accentuate representative dish
                  return (
                    <li 
                      key={idx} 
                      className={`text-[15px] flex items-center gap-2.5 ${isMain ? 'font-bold text-[#3c5500]' : 'text-[#201b11]'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isMain ? 'bg-[#3c5500]' : 'bg-[#747967]'}`}></span>
                      {dish}
                    </li>
                  );
                })}
              </ul>

              <div className="pt-3.5 border-t border-[#f8ecdc] flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#444939]">알레르기 요인 정보</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentLunch?.allergens.map((allergen, idx) => {
                    const isAllergic = profile.allergies.includes(allergen) && profile.allergyAlertEnabled;
                    return (
                      <span 
                        key={idx} 
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          isAllergic 
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]' 
                            : 'bg-[#ede1d1] text-[#444939]'
                        }`}
                      >
                        {allergen} {isAllergic && '⚠️'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Expanded Dinner Card view */}
            <section className="bg-white rounded-3xl p-5 shadow-[0px_10px_30px_rgba(79,111,0,0.04)] border border-[#ede1d1]/40 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#f8ecdc] pb-3 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#f8ecdc] flex items-center justify-center text-[#536500]">
                    <span className="material-symbols-outlined text-lg">ramen_dining</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#201b11]">석식 식단</h3>
                </div>
                <span className="text-xs font-semibold text-[#536500] bg-[#d2ea7a] px-3 py-1 rounded-full">
                  {currentDinner?.totalCalories || 720} kcal
                </span>
              </div>
              
              <ul className="space-y-2.5">
                {currentDinner?.dishes.map((dish, idx) => {
                  const isMain = idx === 0 || idx === 2; // Accentuate main components
                  return (
                    <li 
                      key={idx} 
                      className={`text-[15px] flex items-center gap-2.5 ${isMain ? 'font-bold text-[#536500]' : 'text-[#201b11]'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isMain ? 'bg-[#536500]' : 'bg-[#747967]'}`}></span>
                      {dish}
                    </li>
                  );
                })}
              </ul>

              <div className="pt-3.5 border-t border-[#f8ecdc] flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-[#444939]">알레르기 요인 정보</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentDinner?.allergens.map((allergen, idx) => {
                    const isAllergic = profile.allergies.includes(allergen) && profile.allergyAlertEnabled;
                    return (
                      <span 
                        key={idx} 
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          isAllergic 
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]' 
                            : 'bg-[#ede1d1] text-[#444939]/'
                        }`}
                      >
                        {allergen} {isAllergic && '⚠️'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}


        {/* VIEW B: WEEKLY MEAL SCREEN (식단표) */}
        {activeTab === 'meals' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Header section with dynamic M월 N주차 */}
            <section className="flex flex-col gap-1">
              <span className="text-xs font-bold text-[#536500] tracking-wide">주간 식단표</span>
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-extrabold text-[#3c5500] leading-none">
                  {getWeekOfMonth(selectedDate)}
                </h2>
                <div className="flex gap-1 bg-[#f8ecdc] rounded-full p-1 border border-[#ede1d1]/50">
                  <button 
                    onClick={() => {
                      // Navigate to previous week
                      const prevWeek = new Date(selectedDate);
                      prevWeek.setDate(selectedDate.getDate() - 7);
                      setSelectedDate(prevWeek);
                    }}
                    className="p-1 rounded-full text-[#444939] hover:bg-white active:scale-90 transition-transform"
                    title="전주"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Reset to today
                      setSelectedDate(defaultSelectedDate);
                    }}
                    className="p-1 text-xs font-bold text-[#3c5500] flex items-center justify-center px-2 hover:bg-white rounded-full"
                  >
                    오늘
                  </button>
                  <button 
                    onClick={() => {
                      // Navigate to next week
                      const nextWeek = new Date(selectedDate);
                      nextWeek.setDate(selectedDate.getDate() + 7);
                      setSelectedDate(nextWeek);
                    }}
                    className="p-1 rounded-full text-[#444939] hover:bg-white active:scale-90 transition-transform"
                    title="다음주"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Date Swiper Selector (Korean Mon-Fri) */}
            <section className="flex justify-between items-center bg-[#f8ecdc] rounded-[20px] p-2 border border-[#ede1d1]/30">
              {weekDates.map((d, index) => {
                const dayLabel = getKoreanDayOfWeek(d);
                const dayNum = d.getDate();
                const isSelected = d.toDateString() === selectedDate.toDateString();
                const isRealToday = d.toDateString() === today.toDateString();

                return (
                  <button 
                    key={index}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl min-w-[58px] transition-all duration-300 relative ${
                      isSelected 
                        ? 'bg-[#3c5500] text-white shadow-md transform scale-105 font-bold' 
                        : 'text-[#444939] hover:bg-[#ede1d1] hover:text-[#201b11]'
                    }`}
                  >
                    <span className="text-[11px] font-semibold opacity-80">{dayLabel}</span>
                    <span className="text-lg font-extrabold mt-0.5 leading-none">{dayNum}</span>
                    {isRealToday && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[#3c5500]'}`}></span>
                    )}
                  </button>
                );
              })}
            </section>

            {/* Dynamic Selected Day's Lunch detail */}
            <article className="bg-[#ffffff] rounded-3xl p-6 shadow-[0px_10px_30px_rgba(79,111,0,0.04)] border border-[#ede1d1]/40 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f6f00]/5 rounded-bl-[100px] -z-0"></div>
              
              <header className="flex justify-between items-center relative z-10 border-b border-[#f8ecdc] pb-3 mb-1">
                <div className="flex items-center gap-2.5 text-[#536500]">
                  <span className="material-symbols-outlined text-xl">light_mode</span>
                  <h3 className="text-xl font-bold">중식 식단</h3>
                </div>
                <span className="text-xs font-bold bg-[#ede1d1] text-[#444939] px-3.5 py-1 rounded-full">
                  {currentLunch?.totalCalories || 850} kcal
                </span>
              </header>

              <div className="flex flex-col gap-3 relative z-10">
                <p className="text-[17px] text-[#201b11] leading-relaxed">
                  {currentLunch?.dishes.map((dish, idx) => {
                    const isFocus = idx === 2;
                    return (
                      <span key={idx}>
                        {isFocus ? (
                          <strong className="text-[#3c5500] font-extrabold underline decoration-2 underline-offset-4">{dish}</strong>
                        ) : (
                          <span>{dish}</span>
                        )}
                        {idx < (currentLunch?.dishes.length - 1) && ', '}
                      </span>
                    )
                  })}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentLunch?.allergens.map((tag, idx) => (
                    <span key={idx} className="text-[11px] font-semibold bg-[#d2ea7a] text-[#576a00] px-2.5 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Protein Target Bar */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-[#444939]">
                  <span>단백질 하루 목표치 대비 달성률</span>
                  <span className="text-[#3c5500] font-bold">
                    {currentLunch ? Math.round((currentLunch.nutrition.protein / 50) * 100) : 85}%
                  </span>
                </div>
                <div className="w-full bg-[#ede1d1] rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-[#3c5500] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentLunch ? Math.min(100, Math.round((currentLunch.nutrition.protein / 50) * 100)) : 85}%` }}
                  ></div>
                </div>
              </div>
            </article>

            {/* Dynamic Selected Day's Dinner detail */}
            <article className="bg-[#ffffff] rounded-3xl p-6 shadow-[0px_10px_30px_rgba(79,111,0,0.04)] border border-[#ede1d1]/40 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5a4a43]/5 rounded-bl-[100px] -z-0"></div>
              
              <header className="flex justify-between items-center relative z-10 border-b border-[#f8ecdc] pb-3 mb-1">
                <div className="flex items-center gap-2.5 text-[#5a4a43]">
                  <span className="material-symbols-outlined text-xl">dark_mode</span>
                  <h3 className="text-xl font-bold">석식 식단</h3>
                </div>
                <span className="text-xs font-bold bg-[#ede1d1] text-[#444939] px-3.5 py-1 rounded-full">
                  {currentDinner?.totalCalories || 720} kcal
                </span>
              </header>

              <div className="flex flex-col gap-3 relative z-10">
                <p className="text-[17px] text-[#201b11] leading-relaxed">
                  {currentDinner?.dishes.map((dish, idx) => {
                    const isFocus = idx === 0 || idx === 2;
                    return (
                      <span key={idx}>
                        {isFocus ? (
                          <strong className="text-[#5a4a43] font-extrabold">{dish}</strong>
                        ) : (
                          <span>{dish}</span>
                        )}
                        {idx < (currentDinner?.dishes.length - 1) && ', '}
                      </span>
                    )
                  })}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentDinner?.allergens.map((tag, idx) => (
                    <span key={idx} className="text-[11px] font-semibold bg-[#ede1d1] text-[#444939] px-2.5 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Protein Target Bar */}
              <div className="mt-2.5 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-[#444939]">
                  <span>단백질 하루 목표치 대비 달성률</span>
                  <span className="text-[#5a4a43] font-bold">
                    {currentDinner ? Math.round((currentDinner.nutrition.protein / 50) * 100) : 60}%
                  </span>
                </div>
                <div className="w-full bg-[#ede1d1] rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-[#5a4a43] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${currentDinner ? Math.min(100, Math.round((currentDinner.nutrition.protein / 50) * 100)) : 60}%` }}
                  ></div>
                </div>
              </div>
            </article>
          </div>
        )}


        {/* VIEW C: NUTRITION CALCULATOR (영양계산) */}
        {activeTab === 'calc' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Interactive macro scoreboard card */}
            <section className="bg-white rounded-[24px] p-6 shadow-[0px_10px_30px_rgba(79,111,0,0.05)] border border-[#ede1d1]/40 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3c5500]/5 rounded-bl-full pointer-events-none"></div>
              
              <header className="flex justify-between items-end mb-1 relative z-10">
                <div>
                  <h2 className="text-xs font-bold text-[#444939] mb-1">
                    {formatKoreanDate(selectedDate)} 선택 식단 영양
                  </h2>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#3c5500] leading-none">
                      {calcTotals.kcal}
                    </span>
                    <span className="text-xs font-bold text-[#444939]">kcal</span>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  calcTotals.kcal > 1000 
                    ? 'bg-[#ffdad6] text-[#ba1a1a]' 
                    : calcTotals.kcal < 400 
                    ? 'bg-[#f8ecdc] text-[#5a4a43]' 
                    : 'bg-[#d2ea7a] text-[#3c5500]'
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {calcTotals.kcal > 1000 ? 'warning' : calcTotals.kcal < 400 ? 'trending_down' : 'check_circle'}
                  </span>
                  <span>
                    {calcTotals.kcal > 1000 ? '열량 과다' : calcTotals.kcal < 400 ? '열량 영양부족' : '영양 적정량'}
                  </span>
                </div>
              </header>

              <div className="flex flex-col gap-3.5 relative z-10 border-t border-[#f8ecdc] pt-3">
                {/* Protein progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#201b11]">
                    <span>단백질</span>
                    <span>{calcTotals.protein}g <span className="text-[#444939] font-medium text-[11px] ml-1">/ 권장 50g</span></span>
                  </div>
                  <div className="w-full h-2 bg-[#ede1d1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3c5500] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (calcTotals.protein/50)*100)}%` }}></div>
                  </div>
                </div>

                {/* Carbohydrates progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#201b11]">
                    <span>탄수화물</span>
                    <span>{calcTotals.carb}g <span className="text-[#444939] font-medium text-[11px] ml-1">/ 권장 130g</span></span>
                  </div>
                  <div className="w-full h-2 bg-[#ede1d1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#536500] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (calcTotals.carb/130)*100)}%` }}></div>
                  </div>
                </div>

                {/* Fats progress */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#201b11]">
                    <span>지방</span>
                    <span>{calcTotals.fat}g <span className="text-[#444939] font-medium text-[11px] ml-1">/ 권장 40g</span></span>
                  </div>
                  <div className="w-full h-2 bg-[#ede1d1] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5a4a43] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (calcTotals.fat/40)*100)}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Menu Type Filters row (snap-scroll support) */}
            <section className="overflow-hidden">
              <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1.5 snap-x">
                {[
                  { label: '전체', value: 'all' },
                  { label: '밥류', value: 'rice' },
                  { label: '국/찌개', value: 'soup' },
                  { label: '반찬', value: 'side' },
                  { label: '디저트', value: 'dessert' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCalcFilter(item.value as any)}
                    className={`snap-start whitespace-nowrap px-4 py-2 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 border ${
                      calcFilter === item.value 
                        ? 'bg-[#3c5500] text-white border-[#3c5500]' 
                        : 'bg-[#ede1d1] text-[#201b11] border-[#ede1d1] hover:bg-[#ede1d1]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Selection menu checklist based on today's raw lunch + dynamic fallbacks */}
            <section className="flex flex-col gap-3">
              <h3 className="font-bold text-lg text-[#201b11] px-1">선택 가능한 메뉴</h3>
              
              <div className="flex flex-col gap-2.5">
                {activeDayLunch?.dishes.map((dish, index) => {
                  const stats = getDishMacro(dish);
                  const isSelected = calcSelectedDishes.includes(dish);
                  
                  // Filter filtering
                  if (calcFilter !== 'all' && stats.category !== calcFilter) return null;

                  return (
                    <button 
                      key={index}
                      onClick={() => toggleCalcDish(dish)}
                      className={`text-left w-full rounded-[20px] p-4 flex justify-between items-center transition-all active:scale-[0.98] border-2 shadow-sm ${
                        isSelected 
                          ? 'bg-white border-[#3c5500] shadow-[0px_4px_12px_rgba(79,111,0,0.08)]' 
                          : 'bg-white border-transparent shadow-[0px_4px_12px_rgba(79,111,0,0.01)] hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col gap-1 pr-3">
                        <span className={`text-[15px] font-bold ${isSelected ? 'text-[#3c5500]' : 'text-[#201b11]'}`}>
                          {dish}
                        </span>
                        <div className="flex gap-2 items-center text-xs font-semibold text-[#444939]">
                          <span className={`${isSelected ? 'text-[#3c5500]' : 'text-[#444939]'}`}>{stats.kcal} kcal</span>
                          <span className="w-1 h-1 rounded-full bg-[#c4c9b4]"></span>
                          <span>{stats.info}</span>
                        </div>
                      </div>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isSelected 
                          ? 'bg-[#3c5500] border-[#3c5500] text-white' 
                          : 'border-[#c4c9b4] text-transparent'
                      }`}>
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                    </button>
                  );
                })}

                <div className="bg-[#ede1d1]/50 border-2 border-dashed border-[#c4c9b4] rounded-[20px] p-4 text-center">
                  <p className="text-xs text-[#444939] font-medium leading-relaxed">
                    조절하고 싶은 음식을 체크 해제하거나 활성화하여<br />
                    칼로리와 단백질, 탄수화물, 지방 섭취량을 한 눈에 검출하세요!
                  </p>
                </div>
              </div>
            </section>

            {/* Sticky/Fixed absolute result trigger button container */}
            <div className="mt-4">
              <button 
                onClick={() => {
                  alert(`[저장성공] ${calcTotals.kcal} kcal의 오늘의 맞춤 급식 식단이 성공적으로 다이어리에 연동되었으며 누적 영양 통계에 기록되었습니다!`);
                }}
                className="w-full bg-[#3c5500] hover:bg-[#4f6f00] text-white py-4 rounded-[16px] font-bold text-base shadow-[0px_8px_16px_rgba(60,85,0,0.2)] active:scale-95 transition-transform"
              >
                계산 결과 저장하기
              </button>
            </div>
          </div>
        )}


        {/* VIEW D: STUDENT PROFILE SCREEN (프로필) */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            
            {/* Bento-style student profile header widget */}
            <section className="bg-white rounded-[24px] p-6 shadow-[0px_10px_30px_rgba(79,111,0,0.05)] border border-[#ede1d1] relative overflow-hidden flex flex-col items-center text-center">
              {/* Backsplash accent circle */}
              <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#d2ea7a]/30 to-white z-0 pointer-events-none"></div>
              
              <div className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-md mb-3.5 overflow-hidden bg-[#ede1d1]">
                <img 
                  alt="학생 프로필" 
                  className="w-full h-full object-cover" 
                  src={profile.avatarUrl}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="z-10 flex flex-col items-center">
                <h2 className="text-2xl font-extrabold text-[#3c5500] mb-0.5">{profile.name}</h2>
                <p className="text-xs font-semibold text-[#444939] bg-[#f8ecdc] px-3.5 py-1 rounded-full mb-4">
                  {profile.gradeClass}
                </p>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="bg-[#d2ea7a] text-[#3c5500] hover:bg-[#c9f17c] px-4.5 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[15px] font-bold">edit</span>
                  학생정보 수정
                </button>
              </div>
            </section>

            {/* Interactive settings controls list */}
            <section className="flex flex-col gap-3">
              <h3 className="font-bold text-lg text-[#201b11] px-1">설정 및 알레르기 관리</h3>
              
              <div className="bg-white rounded-3xl border border-[#ede1d1] overflow-hidden shadow-sm">
                
                {/* Allergy control block */}
                <div className="p-4 border-b border-[#f8ecdc]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-[#ba1a1a] fill">warning</span>
                        <h4 className="font-bold text-sm text-[#201b11]">알레르기 경고 알림</h4>
                      </div>
                      <p className="text-xs text-[#444939] leading-relaxed mb-3">
                        내가 민감한 알레르기 성분이 학교 급식 식단표에 들어 있으면 자동으로 감지하여 알립니다.
                      </p>
                    </div>
                    
                    {/* Toggle */}
                    <button 
                      onClick={() => setProfile(p => ({ ...p, allergyAlertEnabled: !p.allergyAlertEnabled }))}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 relative cursor-pointer ${
                        profile.allergyAlertEnabled ? 'bg-[#3c5500]' : 'bg-[#ede1d1]'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        profile.allergyAlertEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Configured allergy pills */}
                  {profile.allergyAlertEnabled && (
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {profile.allergies.map((allergy, idx) => (
                          <span 
                            key={idx} 
                            onClick={() => toggleAllergyPreference(allergy)}
                            className="bg-[#ffdad6] text-[#ba1a1a] font-semibold text-xs px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer hover:bg-red-200 transition-colors"
                          >
                            {allergy}
                            <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                          </span>
                        ))}
                      </div>

                      {/* Add Custom allergen form */}
                      <form onSubmit={addCustomAllergies} className="flex gap-2 mt-2.5">
                        <input 
                          type="text" 
                          placeholder="민감 유발 요인 직접추가 (예: 소고기, 대두 등)"
                          value={customAllergen}
                          onChange={(e) => setCustomAllergen(e.target.value)}
                          className="flex-grow bg-[#fff8f3] text-[#201b11] border border-[#ede1d1] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#3c5500]"
                        />
                        <button 
                          type="submit"
                          className="bg-[#3c5500] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#4f6f00]"
                        >
                          추가
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Daily Alert block */}
                <div className="p-4 border-b border-[#f8ecdc] flex items-center justify-between">
                  <div className="pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#3c5500]">notifications_active</span>
                      <h4 className="font-bold text-sm text-[#201b11]">일일 식단 알림</h4>
                    </div>
                    <p className="text-xs text-[#444939] leading-relaxed">
                      매일 아침 8시 등교 시간에 오늘의 설레는 급식 메뉴 정보를 푸시로 전송받습니다.
                    </p>
                  </div>
                  
                  {/* Toggle */}
                  <button 
                    onClick={() => setProfile(p => ({ ...p, dailyAlertEnabled: !p.dailyAlertEnabled }))}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 relative cursor-pointer ${
                      profile.dailyAlertEnabled ? 'bg-[#3c5500]' : 'bg-[#ede1d1]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      profile.dailyAlertEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Help Centers / Support Links */}
                <button 
                  onClick={() => alert('[안내] 씨마스고등학교 조리행정실(02-123-4567) 혹은 홈페이지 급식신청 게시판을 통해 문의하실 수 있습니다.')}
                  className="w-full p-4 border-b border-[#f8ecdc] flex items-center justify-between hover:bg-[#fff8f3] active:bg-[#f8ecdc] focus:outline-none transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#444939]">help</span>
                    <span className="font-bold text-sm text-[#201b11]">고객센터 / 문의하기</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#444939]">chevron_right</span>
                </button>

                <button 
                  onClick={() => alert('본 급식정보 서비스는 씨마스고등학교 교육행정 공공데이터 및 NEIS 연계를 기본으로 제공하는 교내 전용 공식 플랫폼입니다.')}
                  className="w-full p-4 border-b border-[#f8ecdc] flex items-center justify-between hover:bg-[#fff8f3] active:bg-[#f8ecdc] focus:outline-none transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#444939]">description</span>
                    <span className="font-bold text-sm text-[#201b11]">이용약관 및 정보고지</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#444939]">chevron_right</span>
                </button>

                <button 
                  onClick={() => {
                    const confirmLogout = window.confirm('로그아웃 시 입력된 급식 경고 알림 설정이 유지되지 않을 수 있습니다. 정말 로그아웃하시겠습니까?');
                    if (confirmLogout) alert('보안 로그아웃이 정상 처리되었습니다.');
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-[#ffdad6]/20 transition-colors active:bg-[#ffdad6]/40 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
                    <span className="font-bold text-sm text-[#ba1a1a]">설정 초기화 및 로그아웃</span>
                  </div>
                </button>
              </div>
            </section>

            {/* School Footer */}
            <footer className="mt-4 mb-2 text-center py-6 border-t border-[#f8ecdc]">
              <p className="font-bold text-xs text-[#444939] mb-1">© 2026 씨마스고등학교 급식실 행정팀</p>
              <p className="text-[10px] text-[#747967]">
                본 앱은 학생 중심 맞춤형 급식 환경 조성을 위해 씨마스고등학교 급식소에서 직영 관리합니다.
              </p>
            </footer>
          </div>
        )}

      </main>

      {/* 3. Modal for editing Student Info */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[360px] flex flex-col gap-4 shadow-xl border border-[#ede1d1]">
            <div className="flex justify-between items-center pb-2 border-b border-[#f8ecdc]">
              <h3 className="text-lg font-bold text-[#201b11]">학생 정보 수정</h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-[#444939] hover:bg-[#fff8f3] rounded-full p-1 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={saveProfileChanges} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#444939]">이름</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[#fff8f3] text-[#201b11] border border-[#ede1d1] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3c5500] font-semibold"
                  placeholder="예: 김학생"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#444939]">학번 및 학급 정보</label>
                <input 
                  type="text" 
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="bg-[#fff8f3] text-[#201b11] border border-[#ede1d1] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#3c5500] font-semibold"
                  placeholder="예: 2학년 3반 15번"
                  required
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 bg-[#ede1d1] text-[#201b11] py-2.5 rounded-xl font-bold text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#3c5500] text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40 flex justify-around items-center h-20 bg-white/95 backdrop-blur-md rounded-t-2xl border-t border-[#f8ecdc] shadow-[0px_-4px_20px_rgba(79,111,0,0.06)] px-2">
        {/* Tab 1: 홈 */}
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center rounded-2xl w-16 h-14 transition-all ${
            activeTab === 'home' 
              ? 'bg-[#3c5500] text-white font-bold shadow-md' 
              : 'text-[#444939] hover:bg-[#ede1d1]/50'
          }`}
        >
          <span className={`material-symbols-outlined text-[234px] ${activeTab === 'home' ? 'fill' : ''}`} style={{ fontSize: '24px' }}>home</span>
          <span className="text-[10px] tracking-tight mt-0.5">홈</span>
        </button>

        {/* Tab 2: 식단표 */}
        <button 
          onClick={() => setActiveTab('meals')}
          className={`flex flex-col items-center justify-center rounded-2xl w-16 h-14 transition-all ${
            activeTab === 'meals' 
              ? 'bg-[#3c5500] text-white font-bold shadow-md' 
              : 'text-[#444939] hover:bg-[#ede1d1]/50'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'meals' ? 'fill' : ''}`} style={{ fontSize: '24px' }}>restaurant_menu</span>
          <span className="text-[10px] tracking-tight mt-0.5">식단표</span>
        </button>

        {/* Tab 3: 영양계산 */}
        <button 
          onClick={() => setActiveTab('calc')}
          className={`flex flex-col items-center justify-center rounded-2xl w-16 h-14 transition-all ${
            activeTab === 'calc' 
              ? 'bg-[#3c5500] text-white font-bold shadow-md' 
              : 'text-[#444939] hover:bg-[#ede1d1]/50'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'calc' ? 'fill' : ''}`} style={{ fontSize: '24px' }}>calculate</span>
          <span className="text-[10px] tracking-tight mt-0.5">영양계산</span>
        </button>

        {/* Tab 4: 프로필 */}
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center rounded-2xl w-16 h-14 transition-all ${
            activeTab === 'profile' 
              ? 'bg-[#3c5500] text-white font-bold shadow-md' 
              : 'text-[#444939] hover:bg-[#ede1d1]/50'
          }`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeTab === 'profile' ? 'fill' : ''}`} style={{ fontSize: '24px' }}>person</span>
          <span className="text-[10px] tracking-tight mt-0.5">프로필</span>
        </button>
      </nav>

    </div>
  );
}
