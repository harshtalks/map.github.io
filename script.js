'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout{
    date = new Date()
    id = (Date.now() + '').slice(-10);
    constructor(distance,duration,coords){
        this.distance = distance;
        this.duration = duration
        this.coords = coords //in [lat,lang]
    }

    //funpart. we gotta do this timestamp thing

    _setDiscription(){
        //so this will give us nice formatted string to put a time stamp
        //let's do it
        //if you want our bestie prettier to ignore some formatting then do this
        //prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
         ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout{
    type = 'running'
    constructor(distance,duration,coords,cadence){
        super(distance,duration,coords)
        this.cadence = cadence
        this._calcPace()
        this._setDiscription()
    }

    _calcPace(){
        this.pace = this.duration/this.distance
    }
}

class Cycling extends Workout{
    type = 'cycling'
    constructor(distance,duration,coords,elevationGain){
        super(distance,duration,coords)
        this.elevationGain = elevationGain
        this._calcSpeed()
        this._setDiscription()
    }

    _calcSpeed(){
        this.speed = this.distance/this.duration
    }
}

class App{
    #map;
    #mapEvent;
    #workouts = [];
    #ZoomLevel = 13
    constructor(){
        //to get the position, we neeed to get the current location
        //inside the method '_getPosition' we will call the navigator api
        //calling the method here
        this._getPosition()

        //if there is pre stored data then
        this._getLocalStorage()

        //when input type is toggled then we need to show whether user wants to 
        //save it for running or cycling
        // in that case cadence => elevation Gain and versa.

        inputType.addEventListener('change',this._toggleElevationField)

        //Alrighty harshie
        //time for the form submission
        //what we dop when someone submits the form on the left sidebae?
        //okay so here we go
        //we will call the callback method _newWorkout or something like that lol
        // it will have some helper functions inside the callback to help me validate
        // the values fed by the user
        //sounds pretty simple eh??
        //so event delegation is what we gonna do now
        // delegation is fancy?
        //just keep calling other methods. look at architecture jpg bro! 
        // that shit is real buzzin', respectfully

        form.addEventListener('submit',this._newWorkout.bind(this))

        //so there is this one coool thing i wann talk about now
        //so if you click at any of the object in the list, map will take you to the point 
        //where it was marked (coords of the marker for that object)

        containerWorkouts.addEventListener('click',this._takeMeToPopup.bind(this))
    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),this._failedMap.bind(this))
        }
    }

    _failedMap(){
        alert('failed to load the location. please give us access')
    }

    _loadMap(position){
        const {latitude,longitude} = position.coords
        const coords = [latitude,longitude]

        //from the LeaFlet library here: 

        this.#map = L.map('map').setView(coords, this.#ZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        //Handling clicks on map
        this.#map.on('click',this._showForm.bind(this))

        //finally this one is stored data on markers
        this.#workouts.forEach(work => {
      this._getObjectOnMarker(work);
    });


    }
        
    _showForm(mapE){
        //why mapE argument?
        // so everytime someone clicks on the map, we need to know where that person has 
        //clicked on the map inorder t0 fetch the coords which are in letlng.
        //that's why
        // also saving mapE in a local #mapEvent so we can use it furthur.

        this.#mapEvent = mapE
        console.log(this.#mapEvent)
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _toggleElevationField(){
        //here comes the toggle lol, sometimes i'm damn funny
        //also let's focus on this
        //dont forget to remind me to listen to the weeknd new song and also Doja Cat
        //is a FUCKOING queen
        //PERIODTTTT

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')

    }

    _newWorkout(e){
        //okay so this one is tricky okay
        //i mean unless you already know how this shit works and not a noob like me?
        // if that so, then congo for whatever internship you've got
        // also if you wonder why me writes this much of comments which have nothing to do 
        // with the actual code I'm writing then listen man:
        // In my VSC, this comment is in green color, and i love green color cause i love 
        // FROGS
        // surprising??
        // well then you dont follow my IG ig ( second ig is for iguess)
        // yeah dont worry, its @harshtalks. thank me later

        // back to code

        //first we need to create some small basic yet cool helper functions
        // just to see whether a user is feeding my cute little form a valid inputs
        // don't be smart and give negative inputs
        // that would be so magical if we actually used negative duration


        //this little function will return true if all of the inputs are number
        // and not some creepy pickup line or cussing word
        //  how hypocrite of me? i m promoting my insta here and if u try to d0 the same
        // in my form, you will not be allowed to do that?? bruhhhh
        // also don't you dare to show me your hacking skills? frogs of judgement will look
        //upon ur sins if u do!!
        // BTW ILY

        const validInputs = (...inputs) => {
            return inputs.every(inp => Number.isFinite(inp))
        }

        //similary second helper function will be used to see if all inputs which have
        //contraints to be positive are actually positive

        const allPositiveInputs = (...inputs) => {
            return inputs.every(inp => inp > 0)
        }

        //kaboom done with all of our helper functions
        //really 100% helpful stuffs lol...

        //let's just take the power away from the form submit button
        // ill not let you refresh my web page you little piece of defualt action :////
        
        e.preventDefault()

        //now I'm gonna see what yall actually type on my form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        //asking why plus?
        //cause you all be messing with me
        // i need numbers to find how fast yall be running and shit so str to NUM convfersion

        const {lat, lng} = this.#mapEvent.latlng

        let workout    //to store data lol

        if(type === 'running'){
            //oh wow runner boy
            const cadence = +inputCadence.value
            //let's see if yall be doing it real

            if(!validInputs(distance,duration,cadence) || !allPositiveInputs(distance,duration,cadence)){
                return alert('Yo bestie, positive inputs please 😅')
            }

            workout = new Running(distance,duration,[lat,lng],cadence)
        }

        //what if you've got a cycle??
        // hope it's not a sk bikes made in jalandhar punjab
        // that shit is so bad
        // omg, it had gears like you know that cool bicycle you buy to impress
        // bullies in your class, bruh, those gears never worked and i almost got
        // those gear on my hand while riding that bicycle
        // also one funny stry about tht lol
        // so i was like 15 at that time and there was this one girl  I know, her name 
        // was Olivia (ofcourse changed name, lol you want me to get beaten up or what??)
        // so she was like my bestie, super cute, nice and she used to smell so fucking good
        //OH GODDDD
        //but her bf was kinda jelly of me.. lmao what a loser, jelly of me?
        // is he like okay or what??
        // so whatevwr but he threatened me one day by breaking my way while i was riding
        // my yellow stupid sk bike.
        // olivia doesnot know about me

        //anyways for cyclimg
        
        if(type === 'cycling'){
            //oh wow runner boy
            const elevationGain = +inputElevation.value
            //let's see if yall be doing it real

            if(!validInputs(distance,duration,elevationGain) || !allPositiveInputs(distance,duration)){
                return alert('Yo bestie, positive inputs please 😅')
            }

            workout = new Cycling(distance,duration,[lat,lng],elevationGain)
        }

        //now adding this to workout ARRAY

        this.#workouts.push(workout)

        //render this new workout object to the marker??
        //got you with delegation
        //this method has got you covered
        this._getObjectOnMarker(workout)

        //okay impressive!!!!
        //now what about the little list on the sidebar for users to what they
        //have determined to do this weekend instead of bingewatching bridgerton
        //personally watch bridgerton MAN, everything else can wait
        //since not everyone has a sheldon lee cooper like memory
        // so we do this
        this._getObjectOnList(workout)

        //alrighty 
        //so far we have done so many things
        // now we have to hide the form and shit
        // but how??
        // lol easy
        // another method

        this._hideForm()

        //to add all these data on local storage:
        this._setLocalStorage()
   }

    _getObjectOnMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidthL: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`
        })).setPopupContent(
            `${workout.type === 'running' ? '🏃🏻‍♂️' : '🚴‍♀️'} ${workout.type}`
        )
        .openPopup();
    }

    _getObjectOnList(workout){
        //here we gonna meet my old friend adjcentHTML but he kinda complicated and in toxic
        // relationship with html

        let html = `
                   <li class="workout workout--${workout.type}" data-id="${workout.id}">
                    <h2 class="workout__title">${workout.description}</h2>
                   <div class="workout__details">
                      <span class="workout__icon">🏃‍♂️</span>
                      <span class="workout__value">${workout.distance}</span>
                              </div>
                    <div class="workout__details">
                      <span class="workout__icon">⏱</span>
                      <span class="workout__value">${workout.duration}</span>
                      <span class="workout__unit">min</span>
                    </div>
                   `
        // see this part was common in both of the types
        // running and cycling so we did'nt need much to do about it
        //now we will concatinate

        if(workout.type === 'running'){
            html+= `
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
                   `
        }

        if(workout.type === 'cycling'){
            html+= `
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
                   `
        }

        //her comes the devil
        form.insertAdjacentHTML('afterend', html)
    }

    _hideForm(){
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
        '';

         form.style.display = 'none';
         form.classList.add('hidden');
         setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _takeMeToPopup(e){
        //before you start: if map hasnt loaded and jio fiber is yet to be available in the locality
        // you belong you to then
        if(!this.#map) return

        const workoutEl = e.target.closest('.workout')

        if(!workoutEl) return


        const workout = this.#workouts.find(el => el.id === workoutEl.dataset.id)

    this.#map.setView(workout.coords, this.#ZoomLevel, {
    animate: true,
    pan: {
        duration: 1,
      },
    });
    }

    _setLocalStorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts))
    }

    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'))

        if(!data) return;

        this.#workouts = data

        this.#workouts.forEach(el => {
            this._getObjectOnList(el)
        })
    }

    reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}



//creating an app class
const app = new App()