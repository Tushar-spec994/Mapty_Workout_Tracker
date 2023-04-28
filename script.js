'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//CLASS OF APP
class App {
  #map;
  #mapEvent;

  //CONSTRUCTOR FUNCTION -- CALLED IMMEDIATELY AFTER THE OBJECT IS CREATED
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
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
    console.log(longitude, latitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    console.log(this);
    this.#map = L.map('map').setView(coords, 13);
    // console.log(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //MAP EVENT HANDLER ON CLICK OF MAP
    this.#map.on('click', this._showForm.bind(this));
  }

  //METHOD OF THE CLASS APP TO SHOW THE FORM ON CLICK
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  //METHOD OF THE CLASS APP TO TOGGLE RUNNING TO CYCLING OR VICE VERSA
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //METHOD OF THE CLASS APP TO ADD A NEW WORKOUT
  _newWorkout(e) {
    e.preventDefault();

    //CLEARING DEFAULT VALUES OF INPUT FIELDS.
    inputDuration.value =
      inputDistance.value =
      inputElevation.value =
      inputCadence.value =
        '';

    const { lat, lng } = this.#mapEvent.latlng;

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 280,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}


//OBJECT THE CLASS APP
const app = new App();
