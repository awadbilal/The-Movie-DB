//the API documentation site https://developers.themoviedb.org/3/
// This is the key to use in API postman
// console.log(atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI='));

class App {
  static async run() {
    const movies = await APIService.fetchMovies()
    HomePage.renderMovies(movies);
  }
}

class APIService {
  static TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  // Fetching list of movies then sending the data to Movie Class.
  static async fetchMovies() {
    const url = APIService._constructUrl(`movie/now_playing`)
    const response = await fetch(url)
    const data = await response.json()
    return data.results.map(movie => new Movie(movie))
  }

  //   Fetching the list of popular actors to display: (need to make a class called Actor)
  static async fetchListOfActors() {
    const url = APIService._constructUrl(`person/popular`);
    const response = await fetch(url)
    const data = await response.json();
    return HomePage.renderActors(data.results); 
  }

  // Fetching the movie data for a specific movie then sending data to the Movie Class.
  static async fetchMovie(movieId) {
    const url = APIService._constructUrl(`movie/${movieId}`)
    const response = await fetch(url)
    const data = await response.json()
    return new Movie(data)
  }

  // Fetching the movie credits for a specific movie then sending data to the Movie Class.
  static async fetchActors(movieData) {
    const url = APIService._constructUrl(`movie/${movieData}/credits`)
    const response = await fetch(url)
    const data = await response.json()
    return new Movie(data)
  }

  // Fetching the movie trailer for a specific movie then sending data to the Movie Class.
  static async fetchTrailer(trailer) {
    const url = APIService._constructUrl(`movie/${trailer}/videos`)
    const response = await fetch(url)
    const data = await response.json()
    return new Movie(data)
  }

  // Fetching actor information for a specific actor then sending data to the HomePage Class.
  static async fetchActorInfo(actor) {
    const url1 = APIService._constructUrl(`/person/${actor}`)
    const response1 = await fetch(url1)
    const data1 = await response1.json()

    const url2 = APIService._constructUrl(`/person/${actor}/movie_credits`)
    const response2 = await fetch(url2)
    const data2 = await response2.json()

    return ActorPage.renderActor(data1, data2);
  }

  // Fetching related movies from a specific movie then sending the data to the Movie Class.
  static async fetchRecommendations(recommendations) {
    const url = APIService._constructUrl(`/movie/${recommendations}/similar`)
    const response = await fetch(url)
    const data = await response.json()
    return new Movie(data)
  }

  // Fetching data depending on the search box
  static async fetchSearchedItem(searchText) {
    const url = APIService._constructUrl(`search/multi`) + `&language=en-US&query=${searchText}&page=1&include_adult=false`;
    const response = await fetch(url)
    const data = await response.json();
    return OtherPages.renderSearchBox(data.results);
  }

  static _constructUrl(path) {
    return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
  }
}

// HomePage is to show list of movies / list of Actors
class HomePage {
  static container = document.getElementById('container');
  static renderMovies(movies) {
    // console.log(movies);
    const div = document.createElement("div");
    div.classList.add('row', 'justify-content-center');
    movies.forEach(movie => {

      let windowWidth = '';
      if(window.innerWidth > 991) windowWidth = 'col-3';
      else if(window.innerWidth > 450) windowWidth = 'col-6';
      else windowWidth = 'col-12';

      const movieDiv = document.createElement("div");
      movieDiv.classList.add(windowWidth, 'movieDiv');
      
      const imageDiv = document.createElement("div");
      const movieImage = document.createElement("img");
      movieImage.src = `${movie.backdropUrl}`;
      movieImage.classList.add('moviePageImage', 'AllImages');
      imageDiv.append(movieImage);
      imageDiv.style.cursor = "pointer";

      const titleDiv = document.createElement("div");
      const movieTitle = document.createElement("h5");
      movieTitle.textContent = `${movie.title}`;
      titleDiv.append(movieTitle);

      imageDiv.addEventListener("click", function () {
        Movies.run(movie);
      });

      movieDiv.appendChild(imageDiv);
      movieDiv.appendChild(titleDiv);
      div.append(movieDiv);
      this.container.appendChild(div);
    })
  }

//   Method to render the list of actors page.
  static renderActors(actors){
    // console.log(actors);
    // for(let i = 0; i < actors.le)
    const div = document.createElement('div');
    div.classList.add('row', 'justify-content-center');

    actors.forEach(actor => {
      let imgSrc = '', windowWidth = '';
      if(actor.profile_path === null) imgSrc = './img/defaultPortrait.jpg';
      else imgSrc = Movie.getImage(actor.profile_path);

      if(window.innerWidth > 991) windowWidth = 'col-3';
      else if(window.innerWidth > 450) windowWidth = 'col-6';
      else windowWidth = 'col-12';

      div.innerHTML += `
        <div class=${windowWidth} id="actorDiv" style="cursor:pointer">
          <div>
            <img class="actorPageImage AllImages" src=${imgSrc}>
          </div>
          <div>
            <h5 class="actorDivName">${actor.name}</h5>
          </div>
        </div>
      `;
    });
    this.container.append(div);

    const actorEventListener = function(){
      const actorList = document.getElementById('actorDiv');
      for(let i = 0; i < actorList.length; i++){
        actorList[i].addEventListener('click', function(){
          APIService.fetchActorInfo(actors[i].id);
        });
      }
    }();
  }
}

// Movies class to call all the fetches and pass them to MoviePage
class Movies {
  static async run(movie) {
    const movieData = await APIService.fetchMovie(movie.id)
    const actorsData = await APIService.fetchActors(movie.id);
    const movieTrailer = await APIService.fetchTrailer(movie.id);
    const recommendations = await APIService.fetchRecommendations(movie.id);
    MoviePage.renderMovieSection(movieData, actorsData, movieTrailer, recommendations);
  }
}

// MoviePage gets the container a single movie information and call MovieSection to add movie information
class MoviePage {
  static container = document.getElementById('container');
  static renderMovieSection(movie, actors, trailer, recommendations) {
    MovieSection.renderMovie(movie, actors, trailer, recommendations);
  }
}

// MovieSection is used to generate the single movie page
class MovieSection {
  static renderMovie(movie, actors, trailer, rec) {

    // Generating the string of genres of the movie
    let genres = "(";
    for (let i = 0; i < movie.genres.length; i++) {
      if (i !== movie.genres.length - 1) genres += movie.genres[i].name + ", ";
      else genres += movie.genres[i].name + ")";
    }

    // Generating the trailer key and name to add.
    let trailerKey = "", trailerName = "";
    for (let i = 0; i < trailer.trailer.length; i++) {
      if (trailer.trailer[i].type === 'Trailer') {
        trailerKey = trailer.trailer[i].key;
        trailerName = trailer.trailer[i].name;
      }
    }

    let imgSrc = '';
    if(movie.posterPath === null) imgSrc = './img/defaultPortrait.jpg';
    else imgSrc = Movie.getImage(movie.posterPath);

    MoviePage.container.innerHTML = `
    <div class="row">
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4">
            <img id="movie-backdrop" class="AllImages" src=${imgSrc}> 
          </div>
          
          <div class="col-md-8 justify-content-start">
            <h2 id="movie-title">${movie.title}</h2>
            <p id="genres"> Genres: ${genres}, Language: ${movie.language}</p>
            <p id="movie-release-date">Release Date: ${movie.releaseDate}</p>
            <p id="movie-runtime"> Duration: ${movie.runtime}</p>
            <p id="movieDirector"> Director: </p>
            <p id="movie-rating-votes"> Rating: ${movie.rating}, Votes: ${movie.vote}</p>
            <h3 class="justify-content-center"> Overview: </h3>
            <p id="movie-overview">${movie.overview}</p>
          </div>
        </div>
        
        <br>
        <div class='embed-responsive embed-responsive-16by9'>
          <iframe class="embed-responsive-item" src=${Movie.getMovieTrailer(trailerKey)} title=${trailerName} allowfullscreen></iframe>
        </div>
        
        <br>
        <div class="column">
          <h3> Related Movies: </h3>
          <div id="relatedMovies" class="row justify-content-center"> </div>
        </div>

        <br>
        <div class="column">
          <h3> Production Companies: </h3>
          <div id="producers" class="row justify-content-center"> </div>
        </div>
      </div>

      <div class="col-md-4">
        <h3> Cast: </h3>
        <div id="actorsContainer" class="row justify-content-center"> </div>
      </div>
    </div>
    `;

    const renderActors = function () {
      const container = document.getElementById('actorsContainer');
      for (let i = 0; i < 8; i++) {
        let imgSrc = '';
        if(actors.cast[i].profile_path === null) imgSrc = './img/defaultPortrait.jpg';
        else imgSrc = Movie.getImage(actors.cast[i].profile_path);

        container.innerHTML += `
          <div class="col-6 actorList" style="cursor:pointer">
            <div>
              <img src=${imgSrc} class="actorPicture AllImages">
            </div>
            <div>
              <p>${actors.cast[i].name}</p>
            </div>
          </div>
        `;
      }

      const actorEventListener = function () {
        const list = document.getElementsByClassName('actorList');
        for (let i = 0; i < list.length; i++) {
          list[i].addEventListener('click', function () {
            APIService.fetchActorInfo(actors.cast[i].id);
          });
        }
      }();
    }();

    const renderDirector = function () {
      const container = document.getElementById('movieDirector');
      for (let i = 0; i < actors.crew.length; i++) {
        if (actors.crew[i].job === 'Director') container.textContent += `${actors.crew[i].name}`;
      }
    }();

    console.log(movie.producers);
    const renderProducers = function () {
      const container = document.getElementById('producers');
      for (let i = 0; i < movie.producers.length; i++) {
        container.innerHTML += `
          <div class="col-4">
            <div>
              <img src=${Movie.getImage(movie.producers[i].logo_path)} class="producerImg">
            </div>
            <div>
              <p> ${movie.producers[i].name} </p>
            </div>
          </div>
        `;
      }
    }();

    const renderRelatedMovies = function () {
      const container = document.getElementById('relatedMovies');

      // Generating an array of random numbers to generate related movies.
      const length = rec.recommendations.length, randomArr = [], chosenElement = [];
      for (let i = 0; i < length; i++) randomArr.push(i);

      container.innerHTML += `<br>`;

      if (length < 6) {
        for (let i = 0; i < length; i++) {
          let imgSrc = '';
          if(rec.recommendations[i].backdrop_path === null) imgSrc = './img/defaultHorizontal.jpg';
          else imgSrc = Movie.getImage(rec.recommendations[i].backdrop_path);

          container.innerHTML += `
            <div class="col-6 relatedMovieListener" style="cursor:pointer">
              <div>
                <img src=${imgSrc} class="relatedImg AllImages">
              </div>
              <div class="col-6 relatedMovieListener" style="cursor:pointer">
              <div>
                <span class="relatedMovie">${rec.recommendations[i].title}</span>
              </div>
            </div>
          `;
        }
      }
      else {
        for (let i = 0; i < 6; i++) {
          let getRandom = randomArr[Math.floor(Math.random() * randomArr.length)];
          while (chosenElement.includes(getRandom)) {
            getRandom = randomArr[Math.floor(Math.random() * randomArr.length)];
          }

          let imgSrc = '';
          if(rec.recommendations[getRandom].backdrop_path === null) imgSrc = './img/defaultHorizontal.jpg';
          else imgSrc = Movie.getImage(rec.recommendations[getRandom].backdrop_path);

          container.innerHTML += `
            <div class="col-6 relatedMovieListener" style="cursor:pointer">
              <div>
                <img src=${imgSrc} class="relatedImg AllImages">
              </div>
              <div>
                <span class="relatedMovie">${rec.recommendations[getRandom].title}</span>
              </div>
            </div>
          `;
          chosenElement.push(getRandom);
        }
      }

      // Add an event listener to go the page of the selected recommended page.
      const relatedMoviesEventListener = function () {
        const list = document.getElementsByClassName('relatedMovieListener');
        for (let i = 0; i < 6; i++) {
          list[i].addEventListener('click', function () {
            const movieTitle = document.getElementsByClassName('relatedMovie')[i].innerHTML;
            for (let j = 0; j < rec.recommendations.length; j++) {
              if (rec.recommendations[j].title == movieTitle) Movies.run(rec.recommendations[j]);
              else continue;
            }
          });
        }
      }();
    }();
  }
}

class ActorPage {

  static container = document.getElementById('container');

  // A method to create the single actor page that takes the actor and his movies as a parameter.
  static async renderActor(actor, movies) {

    // Declaring variables that will store age, gender, and birth-death values.
    let actorDates = "", actorAge = 0, gender = "";

    // Checking if the actor is alive or not to display his birthdate - deathdate.
    if (actor.deathday === null) actorDates = actor.birthday;
    else actorDates = `${actor.birthday} - ${actor.deathday}`;

    // Assigning the gender to the actor.
    if (actor.gender === 1) gender = 'Female';
    else gender = 'Male';

    // A self calling function that will calculate the age of the actor:
    if (actor.birthday === null) {
      actorDates = "Unknown";
      actorAge = "Unknown";
    }
    else {
      const calculateAge = function () {
        const age = actor.birthday.split('-');
        const currentDate = new Date().getDate();                           // Get the current date value
        const currentMonth = new Date().getMonth() + 1;                     // Get the current month value
        const currentYear = new Date().getFullYear();                       // Get the current year value
        if (currentMonth < age[1]) actorAge = currentYear - age[0] + 1;
        else if (currentMonth > age[1]) actorAge = currentYear - age[0];
        else {
          if (currentDate < age[2]) actorAge = currentYear - age[0] + 1;
          else actorAge = currentYear - age[0];
        }
      }();
    }

    // Adding actor information to the page.
    let imgSrc = '';
    if(actor.profile_path === null) imgSrc = './img/defaultPortrait.jpg';
    else imgSrc = Movie.getImage(actor.profile_path);

    MoviePage.container.innerHTML = `
      <div class="column">
        <div class="row">
          <div class="col-md-4">
            <img id="movie-backdrop" class="AllImages" src=${imgSrc} alt=${actor.name}> 
          </div>

          <div class="col-md-8">
            <div>
              <h2 id="actorName"> ${actor.name} </h2>
              <p id="actorAge"> Age: ${actorAge}</p>
              <p id="actorBirthday"> Date of Birth: ${actorDates}</p>
              <p id="actorPlaceOfBirth"> Place of Birth: ${actor.place_of_birth}</p>
              <p id="actorGender"> Gender: ${gender}</p>
              <p id="actorKnownFor"> Known for: ${actor.known_for_department}</p>
              <p id="popularity"> Popularity: ${actor.popularity}</p>

              <h4>Biography:</h4>
              <p id="actorBiography">${actor.biography}</p>
            </div>
          </div>
        </div>

        <br>
        <div class="row" id="moviesList"> </div>
      </div>
    `;

    // Adding the movie list to the page.
    const addMovies = function () {
      const container = document.getElementById('moviesList');
      
      if (movies.cast.length > 11) for (let i = 0; i < 12; i++) {
        let imgSrc = '';
        if(movies.cast[i + 1].backdrop_path === null) imgSrc = './img/defaultHorizontal.jpg';
        else imgSrc = Movie.getImage(movies.cast[i + 1].backdrop_path);

        container.innerHTML += `
          <div class="col-3 actorMoviesListener" style="cursor:pointer">
            <div>
              <img class="movieImg AllImages" src=${imgSrc} alt=${movies.title}>
            </div>
            <div>
              <h4 class='actorMovie'>${movies.cast[i + 1].title}</h4>
            </div>
          </div>
        `;
      }
      else for (let i = 0; i < movies.cast.length; i++) {
        let imgSrc = '';
        if(movies.cast[i].backdrop_path === null) imgSrc = './img/defaultHorizontal.jpg';
        else imgSrc = Movie.getImage(movies.cast[i].backdrop_path);
        container.innerHTML += `
          <div class="col-3 actorMoviesListener" style="cursor:pointer">
            <div>
              <img class="movieImg AllImages" src=${imgSrc} alt=${movies.title}>
            </div>
            <div>
              <h4 class='actorMovie'>${movies.cast[i].title}</h4>
            </div>
          </div>
        `;
      }
    }();

    // Event Listener for the movies
    const actorMoviesEventListener = function () {
      const list = document.getElementsByClassName('actorMoviesListener');
      if(movies.cast.length > 11) for (let i = 0; i < 12; i++) {
        list[i].addEventListener('click', function () {
          const movieTitle = document.getElementsByClassName('actorMovie')[i].innerHTML;
          for (let j = 0; j < movies.cast.length; j++) {
            if (movies.cast[j].title == movieTitle) Movies.run(movies.cast[j]);
            else continue;
          }
        });
      }
      else for (let i = 0; i < movies.cast.length; i++) {
        list[i].addEventListener('click', function () {
          const movieTitle = document.getElementsByClassName('actorMovie')[i].innerHTML;
          for (let j = 0; j < movies.cast.length; j++) {
            if (movies.cast[j].title == movieTitle) Movies.run(movies.cast[j]);
            else continue;
          }
        });
      }
    }();
  }
}

class Movie {
  static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
  static TRAILER_BASE_URL = 'https://www.youtube.com/embed/'
  constructor(json) {
    // console.log(json);
    this.id = json.id;
    this.title = json.title;
    this.releaseDate = json.release_date;
    this.runtime = json.runtime + " minutes";
    this.overview = json.overview;
    this.backdropPath = json.backdrop_path;
    this.posterPath = json.poster_path;
    this.language = json.original_language;
    this.vote = json.vote_count;
    this.rating = json.vote_average;
    this.genres = json.genres;
    this.producers = json.production_companies;
    this.cast = json.cast;
    this.crew = json.crew;
    this.trailer = json.results;
    this.recommendations = json.results;
  }

  get backdropUrl() {
    return this.posterPath ? Movie.BACKDROP_BASE_URL + this.posterPath : "";
  }

  static getImage(url) {
    return Movie.BACKDROP_BASE_URL + url;
  }

  static getMovieTrailer(url) {
    return Movie.TRAILER_BASE_URL + url;
  }
}

class OtherPages {
  static container = document.getElementById('container');
  static renderContactPage (){
    this.container.innerHTML += `
      <div class="row">
        <div class="col-12"><h1>Bilal Avvad</h1></div>
        <div class="col-4">
          <img src="https://avatars.githubusercontent.com/u/81809505?v=4" alt="Bilal Avvad" class="selfImage">
        </div>
        <div class="col-8 contactMe">
          <a href="https://github.com/awadbilal" target="_blank">Github</a> <br>
          <a href="https://www.linkedin.com/in/bilal-avvad/" target="_blank">LinkedIn</a> <br>
          <a href="https://instagram.com/awadbilal" target="_blank">Instagram</a> <br>
          <a href="./img/cv.pdf" target="_blank">CV</a>
        </div>
      </div>
    `;
  }
  
  static renderAboutPage(){
    this.container.innerHTML = `
      <div class="content justify-content-center">
        <div class="aboutUs">
          <h2>Hi there!</h2>
          <h3>Let's talk about "The Movie DB"</h3>
          <p>
            The aim of this website is to allow the user to freely interact and gain information about any movie/actor wanted. With all updated database and responsive website. Your laugh brings us joy! The advantages of using this website are:
          </p>
        </div>
        <div>
          <h3> 1) Find updated newest movies:</h3>
          <p> The website provide you with a list of movies out there, and updated at all times!. You can check related movies, movie trailer, cast, and even the producers of the movie. All with just one click away.</p>

          <h3> 2) Find updated newest actors information:</h3>
          <p> Not only we have all updated movies, also all updated actors information, if you click on any actor you will find a brief explanation about the actor, their age, date of birth, and even their movies!</p>

          <h3> 3) Filter movies depending on your preference:</h3>
          <p> Using one single button, you can filter out the movies to the preference of your choice, want some comedy movies ? just click that button and magic will happen.</p>

          <h3> 4) Search movies and actors:</h3>
          <p> Looking for a specific movie/actor ? all you need to do is type its name in the search box, and vwallah, its showcasing all matching names for you!</p>
        </div>
        <br>
        <div class="aboutUs">
          <h2> If you encountered any issue or bugs please contact us!</h2>
        </div>
      </div>
    `;
  }

  static renderSearchBox(data){
    // console.log(data);
    const div = document.createElement('div');
    div.classList.add('row', 'justify-content-center');
    const moviesActorsArr = [];

    for(let i = 0; i < data.length; i++){
      if(data[i].media_type === 'movie' || data[i].media_type === 'person') moviesActorsArr.push(data[i]);
    }

    for(let i = 0; i < moviesActorsArr.length; i++){
      if(moviesActorsArr[i].media_type === 'movie'){
        div.innerHTML += `
          <div class="col-3 searchDiv" style="cursor:pointer">
            <div>
              <img class="searchImage AllImages" src=${Movie.getImage(moviesActorsArr[i].poster_path)}>
            </div>
            <div>
              <h5>${moviesActorsArr[i].title}</h5>
            </div>
          </div>
        `;
      }
      else {
        div.innerHTML += `
          <div class="col-3 searchDiv" style="cursor:pointer">
            <div>
              <img class="searchImage AllImages" src=${Movie.getImage(moviesActorsArr[i].profile_path)}>
            </div>
            <div>
              <h5>${moviesActorsArr[i].name}</h5>
            </div>
          </div>
        `;
      }
    }
    this.container.append(div);

    // Adding an event listener to go to specific actor / movie
    const searchDiv = document.getElementsByClassName('searchDiv');
    for(let i = 0; i < searchDiv.length; i++){
      searchDiv[i].addEventListener('click', function(){
        document.getElementById('container').innerHTML = "";
        console.log(moviesActorsArr[i]);
        if(moviesActorsArr[i].media_type === 'movie') Movies.run(moviesActorsArr[i]);
        else APIService.fetchActorInfo(moviesActorsArr[i].id);
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", App.run);

const homeButton = document.getElementById('homeButton');
const moviesButton = document.getElementById('moviesHomePage');
const actorsButton = document.getElementById('actorsHomePage');
const aboutButton  = document.getElementById('aboutHomePage');
const contactButton = document.getElementById('contactUsPage');
const searchButton = document.getElementById('search');

homeButton.style.cursor = 'pointer';
homeButton.addEventListener('click', function(){
  moviesButton.classList.remove('active');
  actorsButton.classList.remove('active');
  aboutButton.classList.remove('active');
  document.getElementById('container').innerHTML = "";
  App.run();
});

moviesButton.style.cursor = 'pointer';
moviesButton.addEventListener('click', function(){
  document.getElementById('container').innerHTML = "";
  App.run();
});

actorsButton.style.cursor = 'pointer';
actorsButton.addEventListener('click', function(){
  document.getElementById('container').innerHTML = "";
  APIService.fetchListOfActors();
});

aboutButton.style.cursor = 'pointer';
aboutButton.addEventListener('click', function(){
  document.getElementById('container').innerHTML = "";
  OtherPages.renderAboutPage();
});

contactButton.style.cursor = 'pointer';
contactButton.addEventListener('click', function(){
  document.getElementById('container').innerHTML = "";
  OtherPages.renderContactPage();
});

searchButton.style.cursor = 'pointer';
searchButton.addEventListener('click', function(e){
  const searchBox = document.getElementById('searchBox').value;
  document.getElementById('container').innerHTML = "";
  e.preventDefault();
  APIService.fetchSearchedItem(searchBox);
});
