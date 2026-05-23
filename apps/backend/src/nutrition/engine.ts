export type Metrics = { sex: 'male'|'female'; age: number; heightCm: number; weightKg: number; activityMultiplier: number; goal: 'cut'|'maintain'|'bulk' };
export const calculateNutrition = (m: Metrics) => {
  const bmr = m.sex === 'male' ? 10 * m.weightKg + 6.25 * m.heightCm - 5 * m.age + 5 : 10 * m.weightKg + 6.25 * m.heightCm - 5 * m.age - 161;
  const tdee = bmr * m.activityMultiplier;
  const calories = m.goal === 'cut' ? tdee - 450 : m.goal === 'bulk' ? tdee + 300 : tdee;
  const proteinG = Math.round((calories * 0.3) / 4);
  const carbsG = Math.round((calories * 0.4) / 4);
  const fatsG = Math.round((calories * 0.3) / 9);
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), calories: Math.round(calories), proteinG, carbsG, fatsG };
};
