const defaults = {
  heightCm: 177,
  weightKg: 76,
  hoursOnBike: 0,
  averagePowerWatts: 180,
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

const form = document.querySelector('#planner-form');
const number = value => Number.parseFloat(value) || 0;
const rounded = value => Math.round(value).toLocaleString('en-US');

function readInputs() {
  const inputs = new FormData(form);
  return Object.fromEntries(Object.keys(defaults).map(name => [name, number(inputs.get(name))]));
}

function updateUrl(input) {
  const url = new URL(window.location.href);
  Object.entries(input).forEach(([name, value]) => url.searchParams.set(name, value));
  history.replaceState(null, '', url);
}

function render(input) {
  const base = input.weightKg * 5;
  const cycling = input.hoursOnBike * input.carbohydratesPerBikeHour;
  const total = base + cycling;
  const listed = Math.max(0, total - input.carbohydratesFromOtherFoodsPerDay);

  document.querySelector('#total-carbs').textContent = rounded(total);
  document.querySelector('#carbs-per-kg').textContent = input.weightKg ? (total / input.weightKg).toFixed(1) : '0.0';
  document.querySelector('#base-carbs').textContent = rounded(base);
  document.querySelector('#cycling-carbs').textContent = rounded(cycling);
  document.querySelector('#listed-carbs').textContent = rounded(listed);
  document.querySelector('#other-carbs').textContent = rounded(input.carbohydratesFromOtherFoodsPerDay);

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
  updateUrl(input);
  render(input);
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
