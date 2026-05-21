/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealData, NutritionInfo } from './types';
import { formatDateKey } from './utils';

export interface DishMacro {
  name: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  category: 'rice' | 'soup' | 'side' | 'dessert';
  info: string;
}

export const DISH_MACROS: Record<string, DishMacro> = {
  // Rice
  "친환경현미밥": { name: "친환경현미밥", kcal: 300, protein: 6, carb: 65, fat: 1, category: "rice", info: "식이섬유가 풍부한 건강 현미밥" },
  "현미밥": { name: "현미밥", kcal: 300, protein: 6, carb: 65, fat: 1, category: "rice", info: "식이섬유가 풍부한 건강 현미밥" },
  "혼합잡곡밥": { name: "혼합잡곡밥", kcal: 290, protein: 7, carb: 60, fat: 1, category: "rice", info: "단백질과 잡곡이 든든한 밥" },
  "찰보리밥(소)": { name: "찰보리밥(소)", kcal: 100, protein: 2, carb: 22, fat: 0, category: "rice", info: "고소한 찰보리 건강밥" },
  "발아현미밥": { name: "발아현미밥", kcal: 295, protein: 6, carb: 63, fat: 1, category: "rice", info: "발아시켜 소화가 쉬운 현미밥" },
  "미니주먹밥": { name: "미니주먹밥", kcal: 110, protein: 2, carb: 22, fat: 1, category: "rice", info: "한 입 크기의 고소한 김가루 주먹밥" },

  // Soup / Stew
  "쇠고기미역국": { name: "쇠고기미역국", kcal: 120, protein: 12, carb: 5, fat: 4, category: "soup", info: "깊은 맛의 전통 쇠고기 미역국" },
  "돈육김치찌개": { name: "돈육김치찌개", kcal: 180, protein: 14, carb: 6, fat: 12, category: "soup", info: "국산 돈육을 듬뿍 넣은 칼칼한 찌개" },
  "맑은대구지리": { name: "맑은대구지리", kcal: 110, protein: 15, carb: 4, fat: 2, category: "soup", info: "대구살이 통통하고 국물이 시원한 지리" },
  "팽이버섯된장국": { name: "팽이버섯된장국", kcal: 60, protein: 3, carb: 8, fat: 2, category: "soup", info: "전통 된장과 아삭한 팽이버섯 국" },
  "가쓰오장국": { name: "가쓰오장국", kcal: 40, protein: 1, carb: 5, fat: 1, category: "soup", info: "가쓰오부시로 우려낸 감칠맛 국물" },
  "계란파국": { name: "계란파국", kcal: 50, protein: 3, carb: 2, fat: 3, category: "soup", info: "부드러운 계란과 송송 썬 파의 조화" },
  "미니우동": { name: "미니우동", kcal: 150, protein: 4, carb: 30, fat: 1, category: "soup", info: "감칠맛 가득한 따뜻한 가쓰오 우동" },
  "유부장국": { name: "유부장국", kcal: 55, protein: 2, carb: 6, fat: 3, category: "soup", info: "부드러운 유부가 동동 뜬 장국" },

  // Main / Side dish
  "치즈돈까스": { name: "치즈돈까스", kcal: 450, protein: 20, carb: 35, fat: 22, category: "side", info: "고소하고 쫄깃한 치즈 돈까스" },
  "수제함박스테이크": { name: "수제함박스테이크", kcal: 350, protein: 18, carb: 15, fat: 25, category: "side", info: "매장에서 손수 빚어 굽는 스테이크" },
  "안동찜닭": { name: "안동찜닭", kcal: 325, protein: 22, carb: 18, fat: 16, category: "side", info: "달콤 짭조름한 이색 닭찜" },
  "매콤돈육강정": { name: "매콤돈육강정", kcal: 320, protein: 18, carb: 30, fat: 15, category: "side", info: "매콤달콤 돼지고기 강정" },
  "마파두부덮밥": { name: "마파두부덮밥", kcal: 350, protein: 14, carb: 68, fat: 10, category: "rice", info: "부드러운 두부와 중식 두반장 구이" },
  "소시지구이": { name: "소시지구이", kcal: 180, protein: 10, carb: 3, fat: 15, category: "side", info: "노릇하게 구운 소시지" },
  "꿔바로우": { name: "꿔바로우", kcal: 250, protein: 10, carb: 28, fat: 11, category: "side", info: "찹쌀 튀김옷의 탕수육" },
  "짜사이무침": { name: "짜사이무침", kcal: 15, protein: 0, carb: 2, fat: 1, category: "side", info: "꼬들꼬들한 중식 반찬" },
  "숙주미나리무침": { name: "숙주미나리무침", kcal: 30, protein: 2, carb: 4, fat: 1, category: "side", info: "향긋하고 아삭한 나물 무침" },
  "청포묵김가루무침": { name: "청포묵김가루무침", kcal: 45, protein: 1, carb: 8, fat: 1, category: "side", info: "고소한 청포묵 나물" },
  "양배추샐러드": { name: "양배추샐러드", kcal: 45, protein: 1, carb: 8, fat: 1, category: "side", info: "흑임자 소스를 뿌린 양배추 채" },
  "단무지무침": { name: "단무지무침", kcal: 10, protein: 0, carb: 2, fat: 0, category: "side", info: "새콤달콤 매콤한 단무지 버무림" },
  "단단무지": { name: "단무지", kcal: 10, protein: 0, carb: 2, fat: 0, category: "side", info: "아삭한 단무지스" },
  "단무지": { name: "단무지", kcal: 10, protein: 0, carb: 2, fat: 0, category: "side", info: "아삭한 단무지" },
  "배추김치": { name: "배추김치", kcal: 15, protein: 1, carb: 3, fat: 0, category: "side", info: "아삭하고 감칠맛 나는 한국 전통 대표 김치" },
  "깍두기": { name: "깍두기", kcal: 15, protein: 1, carb: 3, fat: 0, category: "side", info: "시원하고 아삭한 무 깍두기" },
  "참치마요덮밥": { name: "참치마요덮밥", kcal: 500, protein: 15, carb: 70, fat: 16, category: "rice", info: "달달 볶은 고소한 참치마요 덮밥" },
  "떡볶이": { name: "떡볶이", kcal: 200, protein: 4, carb: 42, fat: 1, category: "side", info: "고추장 소스의 매콤한 떡볶이" },
  "매콤떡볶이": { name: "매콤떡볶이", kcal: 200, protein: 4, carb: 42, fat: 1, category: "side", info: "고추장 소스의 매콤한 떡볶이" },
  "타코야끼": { name: "타코야끼", kcal: 150, protein: 3, carb: 20, fat: 6, category: "side", info: "고소하고 달콤 짭쪼름한 볼" },
  "수제짜장면": { name: "수제짜장면", kcal: 600, protein: 18, carb: 90, fat: 20, category: "rice", info: "중화풍 불갈비 소스의 쫄깃한 짜장면" },
  "단파이프튀김": { name: "단파이프튀김", kcal: 150, protein: 2, carb: 18, fat: 8, category: "side", info: "바삭바삭 맛있는 모둠 튀김" },
  "스팸마요덮밥": { name: "스팸마요덮밥", kcal: 480, protein: 14, carb: 65, fat: 18, category: "rice", info: "스팸과 마요네즈 김가루 덮밥" },
  "회오리오므라이스": { name: "회오리오므라이스", kcal: 450, protein: 12, carb: 75, fat: 11, category: "rice", info: "돌돌 말린 계란 이불 볶음밥" },
  "콘드레싱": { name: "콘드레싱", kcal: 50, protein: 0, carb: 5, fat: 3, category: "side", info: "달콤 달짝지근한 드레싱" },

  // Desserts
  "요구르트": { name: "요구르트", kcal: 60, protein: 1, carb: 13, fat: 0, category: "dessert", info: "상큼하고 소화를 돕는 전통 디저트" },
  "아이스슈": { name: "아이스슈", kcal: 120, protein: 2, carb: 15, fat: 6, category: "dessert", info: "시원하고 달달한 베이커리 슈" },
  "감귤쥬스": { name: "감귤쥬스", kcal: 70, protein: 1, carb: 16, fat: 0, category: "dessert", info: "제주 감귤의 상큼 가득한 과일주스" }
};

/**
 * Robust helper to calculate nutritional information of a dish.
 */
export function getDishMacro(dishName: string): DishMacro {
  const normalized = dishName.trim();
  const found = DISH_MACROS[normalized];
  if (found) return found;

  // Smart fallback algorithm if not directly matched
  let kcal = 100;
  let protein = 3;
  let carb = 15;
  let fat = 2;
  let category: DishMacro['category'] = 'side';

  if (normalized.includes('밥') || normalized.includes('덮덮') || normalized.includes('면') || normalized.includes('우동') || normalized.includes('오므') || normalized.includes('짜장')) {
    kcal = 300;
    protein = 6;
    carb = 65;
    fat = 1;
    category = 'rice';
  } else if (normalized.includes('국') || normalized.includes('찌개') || normalized.includes('지리') || normalized.includes('탕')) {
    kcal = 110;
    protein = 10;
    carb = 5;
    fat = 6;
    category = 'soup';
  } else if (normalized.includes('요구르트') || normalized.includes('쥬스') || normalized.includes('슈') || normalized.includes('드레싱')) {
    kcal = 70;
    protein = 1;
    carb = 15;
    fat = 1;
    category = 'dessert';
  }

  return {
    name: normalized,
    kcal,
    protein,
    carb,
    fat,
    category,
    info: `${normalized} 영양 정보`
  };
}

/**
 * Generates an array of MealData for lunch and dinner for the 5 week dates.
 */
export function generateMealBatchForWeekDates(weekDates: Date[]): MealData[] {
  const daysKoreanLong = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const meals: MealData[] = [];

  weekDates.forEach((date, index) => {
    const dKey = formatDateKey(date);
    const dayOfWeekStr = daysKoreanLong[date.getDay()];

    // Setup delicious custom configurations for each day
    let lunchMenu: { title: string; dishes: string[]; allergens: string[] };
    let dinnerMenu: { title: string; dishes: string[]; allergens: string[] };

    if (index === 0) { // Monday
      lunchMenu = {
        title: "치즈돈까스 정식",
        dishes: ["현미밥", "쇠고기미역국", "치즈돈까스", "배추김치", "양배추샐러드"],
        allergens: ["대두", "밀", "쇠고기", "돼지고기"]
      };
      dinnerMenu = {
        title: "참치마요덮밥 정식",
        dishes: ["참치마요덮밥", "미니우동", "단무지무침", "배추김치", "요구르트"],
        allergens: ["난류", "우유", "대두", "밀"]
      };
    } else if (index === 1) { // Tuesday
      lunchMenu = {
        title: "수제함박스테이크",
        dishes: ["혼합잡곡밥", "돈육김치찌개", "수제함박스테이크", "숙주미나리무침", "깍두기", "콘드레싱"],
        allergens: ["돼지고기", "밀", "대두"]
      };
      dinnerMenu = {
        title: "마파두부덮밥 정식",
        dishes: ["마파두부덮밥", "계란파국", "꿔바로우", "짜사이무침", "깍두기"],
        allergens: ["난류", "대두", "돼지고기", "밀"]
      };
    } else if (index === 2) { // Wednesday
      lunchMenu = {
        title: "안동찜닭 정식",
        dishes: ["발아현미밥", "맑은대구지리", "안동찜닭", "청포묵김가루무침", "배추김치", "아이스슈"],
        allergens: ["닭고기", "대두", "밀", "우유"]
      };
      dinnerMenu = {
        title: "돈코츠라멘 특식",
        dishes: ["돈코츠라멘", "미니주먹밥", "타코야끼", "단무지", "배추김치"],
        allergens: ["대두", "밀", "돼지고기", "난류"]
      };
    } else if (index === 3) { // Thursday (Exactly matches UI representation from home mockup)
      lunchMenu = {
        title: "매콤돈육강정 정식",
        dishes: ["친환경현미밥", "쇠고기미역국", "매콤돈육강정", "숙주미나리무침", "배추김치"],
        allergens: ["대두", "밀", "쇠고기", "돼지고기"]
      };
      dinnerMenu = {
        title: "참치마요덮밥 정식",
        dishes: ["참치마요덮밥", "유부장국", "매콤떡볶이", "깍두기", "요구르트"],
        allergens: ["난류", "우유", "대두", "밀"]
      };
    } else { // Friday
      lunchMenu = {
        title: "수제짜장면 정식",
        dishes: ["수제짜장면", "찰보리밥(소)", "단파이프튀김", "단무지", "배추김치", "요구르트"],
        allergens: ["대두", "밀", "돼지고기"]
      };
      dinnerMenu = {
        title: "회오리오므라이스",
        dishes: ["회오리오므라이스", "가쓰오장국", "소시지구이", "양배추샐러드", "배추김치"],
        allergens: ["난류", "우유", "토마토", "돼지고기"]
      };
    }

    // Now construct full MealData structures by calculating macros dynamically from dishes list
    const calculateNutrition = (dishes: string[]): NutritionInfo => {
      let kcal = 0;
      let protein = 0;
      let carb = 0;
      let fat = 0;
      dishes.forEach(dish => {
        const stats = getDishMacro(dish);
        kcal += stats.kcal;
        protein += stats.protein;
        carb += stats.carb;
        fat += stats.fat;
      });
      return { kcal, protein, carb, fat };
    };

    const lunchNutrition = calculateNutrition(lunchMenu.dishes);
    const dinnerNutrition = calculateNutrition(dinnerMenu.dishes);

    meals.push({
      id: `${dKey}_lunch`,
      schoolName: "씨마스고등학교",
      date,
      dateKey: dKey,
      dayOfWeek: dayOfWeekStr,
      mealType: 'lunch',
      title: lunchMenu.title,
      dishes: lunchMenu.dishes,
      totalCalories: lunchNutrition.kcal,
      nutrition: lunchNutrition,
      allergens: lunchMenu.allergens
    });

    meals.push({
      id: `${dKey}_dinner`,
      schoolName: "씨마스고등학교",
      date,
      dateKey: dKey,
      dayOfWeek: dayOfWeekStr,
      mealType: 'dinner',
      title: dinnerMenu.title,
      dishes: dinnerMenu.dishes,
      totalCalories: dinnerNutrition.kcal,
      nutrition: dinnerNutrition,
      allergens: dinnerMenu.allergens
    });
  });

  return meals;
}
