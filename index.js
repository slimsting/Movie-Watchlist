const app = {
  APIkey: "183ac45c",
  watchListArr: [],
  searchResultsArr: [],
  init: () => {
    // localStorage.clear();
    document.addEventListener("DOMContentLoaded", app.start);
    console.log("htmly loaded");
  },
  start: () => {
    let page = document.body.id;
    switch (page) {
      case "index":
        console.log("index page loaded...");
        app.index(page);
        break;
      case "watchlist":
        console.log("watchlist page loaded...");
        app.watchList(page);
        break;
      default:
        app.somethingElse;
    }
  },
  index: (page) => {
    document.getElementById("movies-list-container").innerHTML = `
        <div class="message-box">
            <img src="./images/Icon.png"> 
          <h2>Start exploring  </h2>
        </div>`;
    const form = document.getElementById("search-form");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const userInput = formData.get("user-input");
      const movieSearchUrl = `http://www.omdbapi.com/?apikey=${app.APIkey}&s=${userInput}`;
      let movieSearchResultsArray = [];
      // console.log(userInput);

      document.getElementById("user-input").value = "";

      //fetch movie list array using user input as search key
      const respose = await fetch(movieSearchUrl);
      const data = await respose.json();

      //store the array with the list of movies in the search result
      const searchResults = data.Search;
      // console.log(searchResults);

      for (let movie of searchResults) {
        //for every movie in the list of movies in the searchresult array
        // console.log(movie);

        // store its imdbID id to help retreive its details from the API
        const imdbID = movie.imdbID;
        // console.log(imdbID);

        const movieUrl = `http://www.omdbapi.com/?apikey=${app.APIkey}&i=${imdbID}`;

        //catch errors due failed data retreival due to undefined values
        try {
          const response = await fetch(movieUrl);
          const data = await response.json();

          // create an object to hold the required movie details
          const movieObj = {
            imdbID: data.imdbID,
            poster: data.Poster,
            title: data.Title,
            rating: data.Ratings[0].Value,
            runtime: data.Runtime,
            genre: data.Genre,
            plot: data.Plot,
          };

          // poulate the array to hold the movie results for rendering purposes
          movieSearchResultsArray.push(movieObj);
        } catch (err) {
          console.log("Err occured" + err);
        }
      }

      // store the search results array in a global variable to make it accessible anywhere in the app
      app.searchResultsArr = movieSearchResultsArray;

      // call render function giving it the pagesearch array and page ID so it knows where to render
      app.renderMovies(app.searchResultsArr, page);

      // after rendering  the movies to the dom, listen for clicks
      app.listenForMovieSelection();
    });
  },
  listenForMovieSelection: () => {
    // listen for clicks everywhere on the document
    document.addEventListener("click", (e) => {
      const dataSet = e.target.dataset;

      // if the element contains a dataset, it mean it is a button holding a movieID on the dom
      if (dataSet) {
        const buttons = document.getElementsByClassName("movie-button");

        // store the movieID of the movie the user has clicked to help retrieve
        //it from the global array containing an array of the search results
        const selectedMovieImdbID = e.target.dataset.movieid;

        //show that movie is added to watchlist in dom
        for (let button of buttons) {
          if (button.dataset.movieid === selectedMovieImdbID) {
            button.textContent = "added";
            button.style.backgroundColor = "green";
          }
        }

        // initalize an object to hold the selected movie
        let selectedMovieObj = {};

        //loop over the global search results array to find which movie was clicked
        for (let movie of app.searchResultsArr) {
          if (movie.imdbID === selectedMovieImdbID) {
            // if the imdbID of the current movie is the same as the one returned
            // from the datase, store it in the initialized object
            selectedMovieObj = movie;
            // console.log(selectedMovieObj);
          }
        }

        // console.log(selectedMovieObj);

        app.addMovieToWatchlist(selectedMovieObj);
      } else {
        console.log("element without movie id clicked");
      }
    });
  },
  addMovieToWatchlist: (selectedMovie) => {
    if (localStorage.getItem("movieList") == null) {
      localStorage.setItem("movieList", "[]");
    }

    let watchList = JSON.parse(localStorage.getItem("movieList"));

    if (watchList.includes(selectedMovie)) {
      //
      console.log("movie already in list");
    } else {
      watchList.push(selectedMovie);
      console.log(watchList);
      localStorage.setItem("movieList", JSON.stringify(watchList));
    }
  },
  watchList: (page) => {
    app.myWatchListArray = JSON.parse(localStorage.getItem("myWatchList"));
    console.log(app.myWatchListArray);

    if (app.myWatchListArray) {
      app.renderMovies(app.myWatchListArray, page);
      // console.log(app.myWatchListArray);

      document.addEventListener("click", (e) => {
        const imdbID = e.target.dataset.movieid;
        console.log(imdbID);

        for (let movie of app.myWatchListArray) {
          let selectedMovie = {};
          if (movie.imdbID === imdbID) {
            selectedMovie = movie;
            const index = app.myWatchListArray.indexOf(selectedMovie);

            console.log(index);
            if (index > -1) {
              app.myWatchListArray.splice(index, 1);
              app.myWatchListArray = localStorage.setItem(
                "myWatchList",
                JSON.stringify(app.myWatchListArray)
              );
            }
          }
        }

        app.myWatchListArray = JSON.parse(localStorage.getItem("myWatchList"));
        app.renderMovies(app.myWatchListArray, page);
        console.log(app.myWatchListArray.length);
      });
    } else {
      document.getElementById("movies-list-container").innerHTML = `
      <div class="message-box">
        <h2>Your watchlist is looking a little empty... </h2>
        <a href="index.html"><h3>let's add some movies</h3></a>
      </div>`;
    }
  },
  renderMovies: (movieArr, page) => {
    // console.log(`YOOO${movieArr}`);
    let html = "";
    let buttonValue = "";

    if (page === "index") {
      buttonValue = "+ watchlist";
    } else if (page === "watchlist") {
      buttonValue = "- watchlist";
    }

    for (let movie of movieArr) {
      const { imdbID, poster, title, rating, runtime, genre, plot } = movie;

      html += `
                <div class="movie-container">
                      <img
                        alt=" ${title}movie-poster"
                        class="movie-poster"
                        src="${poster}"
                      />
                      <div class="movie-details">
                        <h2>${title} ⭐ ${rating}</h2>
                        <h3 style = "display: flex; gap: 5px;">
                            ${runtime} ${genre}.  
                            <span 
                                id="movie-button" 
                                class ="movie-button"
                                data-movieid="${imdbID}"
                            >${buttonValue}</span></h3>
                        <p>
                         ${plot}
                        </p>
                      </div>
                    </div>
                `;
    }
    document.getElementById("movies-list-container").innerHTML = html;
    // console.log(page);
  },
};
app.init();
