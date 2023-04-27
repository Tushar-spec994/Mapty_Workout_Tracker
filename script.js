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

let map,mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      console.log(longitude, latitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coords = [latitude, longitude];

      map = L.map('map').setView(coords, 13);
      // console.log(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);


      //MAP EVENT HANDLER ON CLICK OF MAP
      map.on('click', function (mapE) {
        mapEvent=mapE;
        form.classList.remove('hidden');
        inputDistance.focus();

        // console.log(mapEvent.latlng);
        // const { lat, lng } = mapEvent.latlng;
        // console.log(lat, lng);

        // L.marker([lat, lng])
        //   .addTo(map)
        //   .bindPopup(
        //     L.popup({
        //       maxWidth: 280,
        //       minWidth: 100,
        //       autoClose: false,
        //       closeOnClick: false,
        //       className: 'running-popup',
        //     })
        //   )
        //   .setPopupContent('Workout')
        //   .openPopup();
      });
    },
    function () {
      alert(`Location could not be found.`);
    }
  );
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  //CLEARING DEFAULT VALUES OF INPUT FIELDS.
  inputDuration.value=inputDistance.value=inputElevation.value=inputCadence.value='';

  const { lat, lng } = mapEvent.latlng;

  L.marker([lat, lng])
    .addTo(map)
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
});

inputType.addEventListener('change',function(){
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
