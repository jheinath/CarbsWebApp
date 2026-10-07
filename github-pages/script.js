const defaults = {
  heightCm: 177,
  weightKg: 76,
  hoursOnBike: 0,
  averagePowerWatts: 180,
  ftpWatts: 253,
  carbohydratesPerBikeHour: 0,
  carbohydratesFromOtherFoodsPerDay: 100
};

const foods = [
  ['Pasta', 0.75, 'dry'], ['Rice', 0.80, 'dry'], ['Potatoes', 0.17, 'raw'],
  ['Oats', 0.60, 'dry'], ['Bread', 0.49, 'as purchased'], ['Bananas', 0.23, 'raw, peeled'],
  ['Apples', 0.14, 'raw'], ['Wraps', 0.50, 'package weight'], ['Quinoa', 0.64, 'dry'],
  ['Couscous', 0.77, 'dry'], ['Flour', 0.76, 'dry'], ['Red lentils', 0.60, 'dry'],
  ['Hokkaido', 0.12, 'raw'], ['Butternut', 0.12, 'raw'], ['Chickpeas', 0.27, 'cooked'],
  ['Kidney beans', 0.23, 'cooked']
];

const mealDefinitions = [
  ['Breakfast', 0.20], ['10:00 snack', 0.10], ['Lunch', 0.25],
  ['15:00 snack', 0.10], ['Dinner', 0.35]
];

const trainingRanges = {
  easy: [3, 5], moderate: [5, 7], hard: [6, 10], veryHigh: [8, 12]
};

function classifyTrainingDay(input) {
  const intensity = input.ftpWatts ? input.averagePowerWatts / input.ftpWatts : 0;
  if (input.hoursOnBike >= 4) return 'veryHigh';
  if (input.hoursOnBike >= 2.5 || intensity >= 0.85) return 'hard';
  if (input.hoursOnBike > 0 && intensity >= 0.65) return 'moderate';
  return 'easy';
}

const form = document.querySelector('#planner-form');
const number = value => Number.parseFloat(value) || 0;
const rounded = value => Math.round(value).toLocaleString('en-US');

function readInputs() {
  const inputs = new FormData(form);
  return Object.fromEntries(Object.keys(defaults).map(name => [name, number(inputs.get(name))]));
}

function updateUrl(input) {
  try {
    const url = new URL(window.location.href);
    Object.entries(input).forEach(([name, value]) => url.searchParams.set(name, value));
    history.replaceState(null, '', url);
  } catch {
    // URL sharing is optional; calculation must also work from file:// URLs.
  }
}

function render(input) {
  const trainingDay = classifyTrainingDay(input);
  const [minPerKg, maxPerKg] = trainingRanges[trainingDay];
  const targetMin = input.weightKg * minPerKg;
  const targetMax = input.weightKg * maxPerKg;
  const cycling = input.hoursOnBike * input.carbohydratesPerBikeHour;
  const target = (targetMin + targetMax) / 2;
  const listed = Math.max(0, target - cycling - input.carbohydratesFromOtherFoodsPerDay);
  const dailyTotal = listed + cycling + input.carbohydratesFromOtherFoodsPerDay;

  document.querySelector('#total-carbs').textContent = rounded(dailyTotal);
  document.querySelector('#carbs-per-kg').textContent = input.weightKg
    ? `${(dailyTotal / input.weightKg).toFixed(1)} g/kg (target ${minPerKg}-${maxPerKg})`
    : `${minPerKg}-${maxPerKg}`;
  document.querySelector('#base-carbs').textContent = `${rounded(targetMin)}-${rounded(targetMax)}`;
  document.querySelector('#cycling-carbs').textContent = rounded(cycling);
  document.querySelector('#listed-carbs').textContent = rounded(listed);
  document.querySelector('#other-carbs').textContent = rounded(input.carbohydratesFromOtherFoodsPerDay);
  document.querySelector('#daily-total').textContent = rounded(dailyTotal);
  document.querySelector('#training-day').textContent = trainingDay === 'veryHigh'
    ? 'Very high-volume day (8-12 g/kg)'
    : trainingDay === 'hard' ? 'Hard or long day (6-10 g/kg)'
    : trainingDay === 'moderate' ? 'Moderate day (5-7 g/kg)'
    : 'Easy/rest day (3-5 g/kg)';

  const meals = mealDefinitions.map(([name, share]) => ({ name, carbohydrates: listed * share }));
  document.querySelector('#meal-table').innerHTML = meals.map(meal =>
    `<tr><td>${meal.name}</td><td>${rounded(meal.carbohydrates)} g</td></tr>`).join('');
  document.querySelector('#meal-cards').innerHTML = meals.map(meal => `
    <article class="meal"><div class="meal-head"><h3>${meal.name}</h3><strong>${rounded(meal.carbohydrates)} g</strong></div>
      ${foods.map(([name, carbsPerGram, basis]) => `<div class="food"><span>${name} <small>(${basis})</small></span><b>${rounded(meal.carbohydrates / carbsPerGram)} g</b></div>`).join('')}
    </article>`).join('');
}

function setFormValues(input) {
  Object.entries(input).forEach(([name, value]) => { form.elements[name].value = value; });
}

const query = new URLSearchParams(window.location.search);
const initial = Object.fromEntries(Object.keys(defaults).map(name => [
  name,
  query.has(name) && query.get(name) !== '' ? number(query.get(name)) : defaults[name]
]));
setFormValues(initial);
render(initial);

form.addEventListener('submit', event => {
  event.preventDefault();
  const input = readInputs();
  render(input);
  updateUrl(input);
});

document.querySelector('#copy-results').addEventListener('click', async () => {
  const message = document.querySelector('#copy-message');
  try {
    await navigator.clipboard.writeText(document.querySelector('#calculation-results').innerText);
    message.textContent = 'Copied';
    window.setTimeout(() => { message.textContent = ''; }, 1800);
  } catch {
    message.textContent = 'Copy failed';
  }
});
