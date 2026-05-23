export type OnboardingField =
  | 'goal'
  | 'age'
  | 'sex'
  | 'heightCm'
  | 'weightKg'
  | 'activityLevel'
  | 'allergies'
  | 'dietType'
  | 'weeklyBudget';

export const onboardingFlow: Array<{ field: OnboardingField; question: string }> = [
  { field: 'goal', question: 'What’s your main goal right now: cut, maintain, or bulk?' },
  { field: 'age', question: 'Nice. How old are you?' },
  { field: 'sex', question: 'For calorie math, what sex should I use: male or female?' },
  { field: 'heightCm', question: 'Height in centimeters?' },
  { field: 'weightKg', question: 'Current weight in kilograms?' },
  { field: 'activityLevel', question: 'How active are you: sedentary, light, moderate, very, or athlete?' },
  { field: 'allergies', question: 'Any allergies I should avoid?' },
  { field: 'dietType', question: 'Preferred style: omnivore, vegetarian, vegan, keto, or other?' },
  { field: 'weeklyBudget', question: 'What weekly grocery budget should I target (USD)?' }
];

export const activityMap: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9
};
