'use strict';

// Index page selection
const form = document.querySelector('.form');
const inputFirstName = document.querySelector('.form-input--first-name');
const inputLastName = document.querySelector('.form-input--last-name');
const inputCalorieBudget = document.querySelector('.form-input--calorie');
const inputProteinTarget = document.querySelector('.form-input--protein');
const btnSetUp = document.querySelector('.btn-set-up');
const btnSubmit = document.querySelector('.btn-submit');
const overrideWarningMsg = document.querySelector('.override-warning-msg');
const overlay = document.querySelector('.overlay');
const overrideBtnContainer = document.querySelector('.opt-btns');

class User {
  date = new Date();

  constructor(firstName, lastName, calorieBudget, proteinTarget) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.calorieBudget = calorieBudget;
    this.proteinTarget = proteinTarget;
  }
}

class Init {
  #newUser;
  #firstName;
  #lastName;
  #calorieBudget;
  #proteinTarget;

  constructor() {
    this._changeFocus();
    form.addEventListener('submit', this._getFormValue.bind(this));
    btnSubmit.addEventListener('click', this._getFormValue.bind(this));
    btnSetUp.addEventListener('click', this._setUp.bind(this));
    overrideBtnContainer.addEventListener(
      'click',
      this._checkOverrideBtn.bind(this)
    );
  }

  _validFirstLastName(...value) {
    return value.some(val => val.includes(' ') || !val);
  }

  _validPositiveNum(...value) {
    return value.every(val => val > 0);
  }

  _getFormValue(e) {
    e.preventDefault();

    const capitalizeName = function (str) {
      return str ? str[0].toUpperCase() + str.slice(1) : str;
    };

    this.#firstName = capitalizeName(inputFirstName.value.trim());
    this.#lastName = capitalizeName(inputLastName.value.trim());
    this.#calorieBudget = +inputCalorieBudget.value;
    this.#proteinTarget = +inputProteinTarget.value;

    if (
      this._validFirstLastName(this.#firstName, this.#lastName) ||
      !this._validPositiveNum(this.#calorieBudget, this.#proteinTarget)
    ) {
      this._resetInputs();
      this._changeFocus();
      return alert('Incorrect Values! Please check and input again.');
    }

    if (this._preventOverride()) return;
    this._createUser();
  }

  _createUser() {
    this.#newUser = new User(
      this.#firstName,
      this.#lastName,
      this.#calorieBudget,
      this.#proteinTarget
    );

    this._setLocalStorage();
    this._changePage();
    this._resetInputs();
  }

  _preventOverride() {
    if (
      localStorage.getItem('food') ||
      localStorage.getItem('foodData') ||
      localStorage.getItem('userData')
    ) {
      overrideWarningMsg.classList.remove('hidden');
      overlay.classList.remove('hidden');
      return true;
    }
    return false;
  }

  _checkOverrideBtn(e) {
    const targetBtn = e.target;

    if (targetBtn.classList.contains('opt-btn-yes')) {
      this._clearLocalStorage('userData');
      this._clearLocalStorage('food');
      this._clearLocalStorage('foodData');

      this._createUser();
    }

    if (targetBtn.classList.contains('opt-btn-no')) {
      btnSetUp.focus();
    }

    this._resetInputs();
    overrideWarningMsg.classList.add('hidden');
    overlay.classList.add('hidden');
  }

  _clearLocalStorage(key) {
    localStorage.removeItem(key);
  }

  _changeFocus() {
    inputFirstName.focus();
  }

  _changePage() {
    window.location.href = './app.html';
  }

  _setUp() {
    if (localStorage.getItem('userData')) return this._changePage();
    else return alert('Sorry! You have not set up previously.');
  }

  _setLocalStorage() {
    localStorage.setItem('userData', JSON.stringify(this.#newUser));
  }

  _resetInputs() {
    inputFirstName.value = '';
    inputLastName.value = '';
    inputCalorieBudget.value = '';
    inputProteinTarget.value = '';
  }
}

const init = new Init();
