'use strict';

// General Elements Selection
const userName = document.querySelector('.user-name');
const labelCircleCalorie = document.querySelector('.circle-calorie-value');
const labelCircleProtein = document.querySelector('.circle-protein-value');
const labelCalorieTarget = document.querySelector('.calorie-target-text');
const labelProteinTarget = document.querySelector('.protein-target-text');
const labelSummaryDate = document.querySelector('.summary-date');
const loggedFoodContainer = document.querySelector('.logged-food-container');
const summaryTextDynamic = document.querySelectorAll('.summary-text-dynamic');
const btnSortByCalories = document.querySelector('.sort-by-calories');
const btnSortByProtein = document.querySelector('.sort-by-protein');
const btnReset = document.querySelector('.reset');

// Form Element Selection
const formFood = document.querySelector('.form-food');
const formInputFoodName = document.querySelector('.form-input-food--name');
const formInputFoodWeight = document.querySelector('.form-input-food--weight');
const formInputFoodCalorie = document.querySelector(
  '.form-input-food--calorie'
);
const formInputFoodProtein = document.querySelector(
  '.form-input-food--protein'
);
const summaryCalorieLabel = document.querySelector('.summary-calorie');
const summaryProteinLabel = document.querySelector('.summary-protein');

// Circle Selection
const circle = document.querySelectorAll('.circle');
const circleCalorie = document.querySelector('.circle-calorie');
const circleProtein = document.querySelector('.circle-protein');

class Food {
  constructor(name, weight, calories, protein) {
    this.name = name;
    this.weight = weight;
    this.calories = calories;
    this.protein = protein;
  }
}

class App {
  // User's data from landing page
  #userData;
  #calorieBudget;
  #proteinTarget;
  #firstName;
  #lastName;
  #loggedDate;

  // Data required for app page
  #foods = [];
  #foodData;
  #previousProteinCircleClass;
  #previousCalorieCircleClass;
  #sortedCalories = false;
  #sortedProtein = false;

  constructor() {
    this._initFoodData();
    this._initPage();
    this._getLocalStorage();

    formFood.addEventListener('submit', this._newFood.bind(this));
    btnSortByCalories.addEventListener('click', this._sortFoods.bind(this));
    btnSortByProtein.addEventListener('click', this._sortFoods.bind(this));
    btnReset.addEventListener('click', this._resetApp.bind(this));
  }

  _initFoodData() {
    this.#foodData = {
      totalConsumedCalories: 0,
      totalConsumedProtein: 0,
      remainingCalories: 0,
      remainingProtein: 0,
    };
  }

  _initPage() {
    this._getLocalStorageUser();
    this._extractUserData();
    this._initTexts();
    this._initLayouts();
    this._formFocus();
  }

  _initLayouts() {
    summaryTextDynamic.forEach(el => el.classList.add('hidden'));
    // btnSort.classList.add('hidden');
    loggedFoodContainer.innerHTML = '';
  }

  _initTexts() {
    labelCircleCalorie.textContent = '' + this.#calorieBudget;
    labelCircleProtein.textContent = '' + this.#proteinTarget;
    labelCalorieTarget.textContent = '' + this.#calorieBudget;
    labelProteinTarget.textContent = '' + this.#proteinTarget;
    labelSummaryDate.textContent = this._getLoggedDate();
    userName.textContent =
      this.#firstName + ' ' + this.#lastName.at(0).toUpperCase();
  }

  // Function to get the user's data from landing page
  _getLocalStorageUser() {
    this.#userData = JSON.parse(localStorage.getItem('userData'));
  }

  // Function to extract the user's data from landing page
  _extractUserData() {
    this.#calorieBudget = this.#userData.calorieBudget;
    this.#firstName = this.#userData.firstName;
    this.#lastName = this.#userData.lastName;
    this.#proteinTarget = this.#userData.proteinTarget;
    this.#loggedDate = new Date(this.#userData.date);
  }

  // Function to get logged date from user's data
  _getLoggedDate() {
    // prettier-ignore
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${
      months[this.#loggedDate.getMonth()]
    } ${this.#loggedDate.getDate()} ${this.#loggedDate.getFullYear()}`;
  }

  _formFocus() {
    formInputFoodName.focus();
  }

  // Function to create new food item
  _newFood(e) {
    e.preventDefault();
    const capitalizeFoodName = function (str) {
      let cap = '';
      str
        .split(' ')
        .forEach(s => (cap += ' ' + s[0].toUpperCase() + s.slice(1)));
      return cap.split().join(' ');
    };

    const validPositive = function (...values) {
      return values.every(val => val > 0);
    };

    const validName = function (name) {
      return name && !Number.isFinite(+name) ? name : false;
    };

    this._formFocus();

    // Get data from form
    const foodName = capitalizeFoodName(formInputFoodName.value);
    const foodWeight = +formInputFoodWeight.value;
    const foodCalorie = +formInputFoodCalorie.value;
    const foodProtein = +formInputFoodProtein.value;

    if (
      !validPositive(foodWeight, foodCalorie, foodProtein) ||
      !validName(foodName)
    )
      return alert('Input must be positive and filled!');

    const newFood = new Food(foodName, foodWeight, foodCalorie, foodProtein);
    this._updateFoodData(foodCalorie, foodProtein);

    // Guard Clause
    if (this._checkOvereat())
      return alert('Oops! You have overate. Data will be restored');

    this.#foods.push(newFood);
    this._setLocalStorage();

    this._updateUI(newFood);
    this._resetFormInputs();
  }

  _checkOvereat() {
    if (
      this.#foodData.totalConsumedCalories > this.#calorieBudget ||
      this.#foodData.totalConsumedProtein > this.#proteinTarget
    ) {
      this._resetApp();
      return true;
    }
  }

  _resetApp() {
    this._clearLocalStorage();
    this._initPage();
    this._initFoodData();
    this._resetFormInputs();
    circleCalorie.classList.remove(this.#previousCalorieCircleClass);
    circleProtein.classList.remove(this.#previousProteinCircleClass);
  }

  _updateFoodData(foodCalorie, foodProtein) {
    this.#foodData.totalConsumedCalories += foodCalorie;
    this.#foodData.totalConsumedProtein += foodProtein;
    this.#foodData.remainingCalories =
      this.#calorieBudget - this.#foodData.totalConsumedCalories;
    this.#foodData.remainingProtein =
      this.#proteinTarget - this.#foodData.totalConsumedProtein;
  }

  _updateUI(food) {
    this._renderFoodsList(food);
    this._renderSummaryText();
    this._changeCircleValues();
    this._changeCircleState();
  }

  _changeCircleValues() {
    labelCircleCalorie.textContent = +this.#foodData.remainingCalories;
    labelCircleProtein.textContent = +this.#foodData.remainingProtein;
  }

  // Function to change the percentage of the circle's border area
  _changeCircleState() {
    const percentCalorie = Math.round(
      (this.#foodData.totalConsumedCalories / this.#calorieBudget) * 100
    );
    const percentProtein = Math.round(
      (this.#foodData.totalConsumedProtein / this.#proteinTarget) * 100
    );

    const currentCalorieCircleClass = `p${percentCalorie}`;
    const currentProteinCircleClass = `p${percentProtein}`;

    if (this.#previousCalorieCircleClass && this.#previousProteinCircleClass) {
      circleCalorie.classList.remove(this.#previousCalorieCircleClass);
      circleProtein.classList.remove(this.#previousProteinCircleClass);
    }

    circleCalorie.classList.add(currentCalorieCircleClass);
    circleProtein.classList.add(currentProteinCircleClass);

    this.#previousCalorieCircleClass = currentCalorieCircleClass;
    this.#previousProteinCircleClass = currentProteinCircleClass;
  }

  _renderFoodsList(food) {
    const html = `<div class="logged-food">
        <p class="food-name"><span>${food.name}</span></p>

        <div class="food-info">
          <div>
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
            >
              <path
                fill="#736E9E"
                d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"
              ></path>
            </svg>

            <p class="food-text"><span>${food.calories}</span> Kcal</p>
          </div>

          <div>
            <svg
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path
                fill="#736E9E"
                d="M462.8 49.57a169.44 169.44 0 0 0-239.5 0C187.82 85 160.13 128 160.13 192v85.83l-40.62 40.59c-9.7 9.69-24 11.07-36.78 6a60.33 60.33 0 0 0-65 98.72C33 438.39 54.24 442.7 73.85 438.21c-4.5 19.6-.18 40.83 15.1 56.1a60.35 60.35 0 0 0 98.8-65c-5.09-12.73-3.72-27 6-36.75L234.36 352h85.89a187.87 187.87 0 0 0 61.89-10c-39.64-43.89-39.83-110.23 1.05-151.07 34.38-34.36 86.76-39.46 128.74-16.8 1.3-44.96-14.81-90.28-49.13-124.56z"
              ></path>
            </svg>
            <p class="food-text"><span>${food.protein}</span>gms Protein</p>
          </div>

          <div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.9194 20.8996L20.4961 7.20599C20.3179 6.49396 19.7254 6.00036 19.049 6.00036H16.2248C16.3922 5.52927 16.5004 5.02911 16.5004 4.50036C16.5004 2.01505 14.4858 0.000366211 12.0004 0.000366211C9.51512 0.000366211 7.50043 2.01505 7.50043 4.50036C7.50043 5.02911 7.60825 5.52927 7.77606 6.00036H4.95184C4.27543 6.00036 3.68246 6.49442 3.50481 7.20599L0.0805859 20.8996C-0.309883 22.461 0.767774 23.9999 2.25137 23.9999H21.749C23.2322 23.9999 24.3098 22.461 23.9194 20.8996V20.8996ZM12 5.99989C11.1731 5.99989 10.5 5.32677 10.5 4.49989C10.5 3.67302 11.1731 2.9999 12 2.9999C12.8268 2.9999 13.5 3.67302 13.5 4.49989C13.5 5.32677 12.8268 5.99989 12 5.99989Z"
                fill="#736E9E"
              />
            </svg>
            <p class="food-text"><span>${food.weight}</span> Gms</p>
          </div>
        </div>
      </div>`;

    loggedFoodContainer.insertAdjacentHTML('beforeend', html);
  }

  _renderSummaryText() {
    summaryTextDynamic.forEach(el => el.classList.remove('hidden'));
    summaryCalorieLabel.textContent = this.#foodData.totalConsumedCalories;
    summaryProteinLabel.textContent = this.#foodData.totalConsumedProtein;
  }

  _resetFormInputs() {
    formInputFoodName.value = '';
    formInputFoodCalorie.value = '';
    formInputFoodProtein.value = '';
    formInputFoodWeight.value = '';
  }

  // Function to set the local storage for food and foodData.
  _setLocalStorage() {
    localStorage.setItem('food', JSON.stringify(this.#foods));
    localStorage.setItem('foodData', JSON.stringify(this.#foodData));
  }

  // Function to get the local storage for food and foodData.
  _getLocalStorage() {
    const data1 = JSON.parse(localStorage.getItem('food'));
    const data2 = JSON.parse(localStorage.getItem('foodData'));

    if (!data1 || !data2) return;

    this.#foods = data1;
    this.#foodData = data2;

    this.#foods.forEach(food => {
      this._renderFoodsList(food);
    });
    this._changeCircleState();
    this._changeCircleValues();
    this._renderSummaryText();
  }

  _clearLocalStorage() {
    localStorage.removeItem('food');
    localStorage.removeItem('foodData');
  }

  // Function to sort foods according to protein or calories
  _sortFoods(e) {
    let tempArr;
    loggedFoodContainer.innerHTML = '';

    if (e.target.classList.contains('sort-by-calories')) {
      this.#sortedProtein = false;
      tempArr = this.#sortedCalories
        ? this.#foods
        : this.#foods.slice().sort((a, b) => b.calories - a.calories);

      if (!this.#sortedCalories) {
        this.#sortedCalories = true;
      } else {
        this.#sortedCalories = false;
      }
    }

    if (e.target.classList.contains('sort-by-protein')) {
      this.#sortedCalories = false;
      tempArr = this.#sortedProtein
        ? this.#foods
        : this.#foods.slice().sort((a, b) => b.protein - a.protein);

      if (!this.#sortedProtein) {
        this.#sortedProtein = true;
      } else {
        this.#sortedProtein = false;
      }
    }
    tempArr.forEach(el => this._renderFoodsList(el));
  }
}

const app = new App();
