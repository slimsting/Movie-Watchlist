const app = {
  APIkey: "183ac45c",
  searchResultsArr: [],
  init: () => {
    document.addEventListener("DOMContentLoaded", app.start);
    // console.log("htmly loaded");
  },
  start: () => {
    let pageID = document.body.id;
    switch (pageID) {
      case "index":
        // console.log("index page loaded...");
        app.index(pageID);
        break;
      case "watchlist":
        console.log("watchlist page loaded...");
        app.watchList(pageID);
        break;
      default:
        app.somethingElse;
    }
  },
  index: (pageID) => {
    const searchForm = document.getElementById("search-form");
    const moviesContainerEl = document.getElementById("movies-list-container");

    moviesContainerEl.innerHTML = `
        <div class="message-box">
            <img src="./images/Icon.png"> 
          <h2>Start exploring</h2>
        </div>`;

    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(searchForm);
      const userInput = formData.get("user-input");

      console.log(userInput);

      const movieSearchUrl = `http://www.omdbapi.com/?apikey=${app.APIkey}&s=${userInput}`;
      console.log(movieSearchUrl);

      //fetch movie list array using user input as search key
      const respose = await fetch(movieSearchUrl);
      const data = await respose.json();

      console.log(data.Response);

      if (data.Response === "True") {
        //store the array with the list of movies in the search result
        const searchResults = data.Search;
        console.log(searchResults);

        let moviesArr = await Promise.all(
          searchResults.map(async (movie) => {
            // console.log(movie);
            try {
              const movieUrl = `http://www.omdbapi.com/?apikey=${app.APIkey}&i=${movie.imdbID}`;
              console.log(movieUrl);
              const response = await fetch(movieUrl);
              const data = await response.json();

              return {
                imdbID: data.imdbID,
                poster: data.Poster,
                title: data.Title,
                rating: data.Ratings[0]?.Value, //
                runtime: data.Runtime,
                genre: data.Genre,
                plot: data.Plot,
                // type: data.
              };
            } catch (err) {
              console.log("Error occured" + err);
            }
          })
        );
        searchForm.reset();

        console.log(moviesArr);
        app.searchResultsArr = moviesArr;

        // call render function giving it the pagesearch array and page ID so it knows where to render
        app.renderMovies(moviesArr, pageID);

        // after rendering  the movies to the dom, listen for clicks
        app.listenForMovieSelection();
      } else {
        moviesContainerEl.innerHTML = `
        <div class="message-box">
          <h2>Unable to find what you’re looking for. Please try another search.</h2>
        </div>`;
      }
    });
  },
  listenForMovieSelection: () => {
    // listen for clicks on a movie button
    document.addEventListener("click", (e) => {
      if (e.target.dataset.id) {
        const movieID = e.target.dataset.id;

        if (movieID) {
          const movieActionBtn = document.getElementById(movieID);
          let selectedMovieObj = {};

          // use the movie id of the selected movie to retrieve the movie object
          // from the global variable holding the search results array

          //refactor to us some
          for (let movie of app.searchResultsArr) {
            if (movie.imdbID === movieID) {
              selectedMovieObj = movie;
              // console.log(selectedMovieObj);
            }
          }
          app.addMovieToWatchlist(selectedMovieObj);

          console.log(movieID)

          // show in dom that the movie has been added
          movieActionBtn.textContent = "added";
          movieActionBtn.style.backgroundColor = "green";
          movieActionBtn.disabled = true;
        } else {
          // do nothing
        }
      }
    });
  },
  addMovieToWatchlist: (selectedMovie) => {
    if (localStorage.getItem("movieList") == null) {
      localStorage.setItem("movieList", "[]");
    }

    let watchList = JSON.parse(localStorage.getItem("movieList"));

    if (watchList.some((e) => e.imdbID === selectedMovie.imdbID)) {
      // show that the movie is already in the list
      console.log("movie already in list");
    } else {
      watchList.push(selectedMovie);
      // console.log(watchList);
      localStorage.setItem("movieList", JSON.stringify(watchList));
    }
  },
  watchList: (pageID) => {
    let movieList = JSON.parse(localStorage.getItem("movieList"));

    // console.log(movieList);
    if (movieList.length > 0) {
      app.renderMovies(movieList, pageID);
      // console.log(app.myWatchListArray);

      document.addEventListener("click", (e) => {
        const imdbID = e.target.id;

        if (imdbID) {
          app.removeMovieFromWatchlist(imdbID, movieList);
          app.renderMovies(movieList, pageID);
        }
      });
    } else {
      document.getElementById("movies-list-container").innerHTML = `
      <div class="message-box">
        <h2>Your watchlist is looking a little empty... </h2>
        <a href="index.html"><h3>let's add some movies</h3></a>
      </div>`;
    }
  },
  removeMovieFromWatchlist: (imdbID, movieList) => {
    const indexOfSelectedMovie = movieList.findIndex(
      (movie) => movie.imdbID === imdbID
    );
    movieList.splice(indexOfSelectedMovie, 1);

    movieList = localStorage.setItem("movieList", JSON.stringify(movieList));
    console.log(movieList);
  },
  renderMovies: (movieArr, pageID) => {
    // console.log(`YOOO${movieArr}`);
    let html = "";
    let buttonValue = "";

    if (pageID === "index") {
      buttonValue = "+ watchlist";
    } else if (pageID === "watchlist") {
      buttonValue = "- watchlist";
    }

    for (let movie of movieArr) {
      const { imdbID, poster, title, rating, runtime, genre, plot } = movie;

      // create a different file for template strings
      html += `
                <div class="movie-container">
                      <img
                        alt=" ${title}movie-poster"
                        class="movie-poster"
                        src="${poster}"
                      />
                      <div class="movie-details">
                        <h3>${title} <span>⭐ ${rating}</span></h3>
                        <div style ="display: flex; gap: 5px;">
                          <span>${runtime}</span>
                          <span>${genre}</span>  
                          <span 
                            id="${imdbID}"
                            data-id="${imdbID}" 
                            class ="movie-button">${buttonValue}
                          </span>
                        </div>
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
