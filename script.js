'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //km
    this.duration = duration; //min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    //Running on April 14
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([23, 32], 23, 90, 120);
// const cycling1 = new Cycling([23, 32], 34, 80, 21);
// console.log(run1, cycling1);

//CLASS OF APP
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];

  //CONSTRUCTOR FUNCTION -- CALLED IMMEDIATELY AFTER THE OBJECT IS CREATED
  constructor() {
    //GET USER'S LOCATION
    this._getPosition();

    //GET LOCAL STORAGE
    this._getLocalStorage();

    //ADDING NEW WORKOUT TO THE MAP
    form.addEventListener('submit', this._newWorkout.bind(this));

    //TOGGLE CYCLING/RUNNING
    inputType.addEventListener('change', this._toggleElevationField);

    //MOVE THE MAP TO THE WORKOUT POINT
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  //METHOD OF A CLASS TO GET THE POSITION USING GEOLOCATION
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`Location could not be found.`);
        }
      );
    }
  }

  //METHOD OF A CLASS TO LOAD THE MAP USING THE POSITION FROM _getPosition
  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(longitude, latitude);
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    // console.log(this);
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    // console.log(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //MAP EVENT HANDLER ON CLICK OF MAP
    this.#map.on('click', this._showForm.bind(this));

    //LOADING MARKER OF THE STORED WORKOUTS
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  //METHOD OF THE CLASS APP TO SHOW THE FORM ON CLICK
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  //HIDE THE FORM AFTER CLICKING SUBMIT
  _hideForm() {
    //CLEARING DEFAULT VALUES OF INPUT FIELDS.
    inputDuration.value =
      inputDistance.value =
      inputElevation.value =
      inputCadence.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  //METHOD OF THE CLASS APP TO TOGGLE RUNNING TO CYCLING OR VICE VERSA
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //METHOD OF THE CLASS APP TO ADD A NEW WORKOUT
  _newWorkout(e) {
    e.preventDefault();

    //FUNCTION TO CHECK IF THE INPUT IS NUMBER OR NOT
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    //FUNCTION TO CHECK IF THE INPUT IS POSITIVE OR NOT
    const allPositives = (...inputs) => inputs.every(inp => inp >= 0);

    //input data from the form
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout is running, create a running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      //check if the input data is valid
      if (
        !validInputs(duration, distance, cadence) ||
        !allPositives(duration, distance, cadence)
      )
        return alert('Invalid Input!!');

      //OBJECT CREATED
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if workout is cycling, create a cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      //check if the input data is valid
      if (
        !validInputs(duration, distance, elevation) ||
        !allPositives(duration, distance)
      )
        return alert('Invalid Input!!');

      //OBJECT CREATED
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //add the new object to the workout array
    this.#workouts.push(workout);
    // console.log(workout);

    //render workout on map as a marker
    this._renderWorkoutMarker(workout);
    this.renderWorkout(workout);

    //HIDE THE FORM ONCE SUBMITTED
    this._hideForm();

    //CREATING A LOCAL STORAGE
    this._setLocalStorage();
  }

  //FUNCTION TO CHANGE THE DESIGN OF THE MARKER IN THE MAP
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 280,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  //FUNCTION TO RENDER THE WORKOUTS TAB BELOW THE FORM
  renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    }

    if (workout.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }

  //FUNCTION TO MOVE THE VIEW TOWARDS THE WORKOUT POINT
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    // console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => workoutEl.dataset.id === work.id
    );
    // console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // console.log(data);

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this.renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

//OBJECT THE CLASS APP
const app = new App();
