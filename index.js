const app = {
  APIkey: "183ac45c",
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
    // localStorage.clear();
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
      // console.log(movieSearchUrl);

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
        // console.log(movieUrl);

        //catch errors due failed data retreival due to undefined values
        try {
          const response = await fetch(movieUrl);

          if (respose.ok) {
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
          } else {
            throw new Error("could not retreive results");
          }
        } catch (err) {
          console.log("Err occured" + err);
        } finally {
          // store the search results array in a global variable to make it accessible anywhere in the app
          app.searchResultsArr = movieSearchResultsArray;
        }
      }
      console.log(app.searchResultsArr);

      // call render function giving it the pagesearch array and page ID so it knows where to render
      app.renderMovies(app.searchResultsArr, page);

      // after rendering  the movies to the dom, listen for clicks
      app.listenForMovieSelection();
    });
  },
  listenForMovieSelection: () => {
    // listen for clicks on a movie button
    document.addEventListener("click", (e) => {
      const movieID = e.target.id;

      if (movieID) {
        const button = document.getElementById(movieID);
        let selectedMovieObj = {};

        // use the movie id of the selected movie to retrieve the movie object
        // from the global variable holding the search results array
        for (let movie of app.searchResultsArr) {
          if (movie.imdbID === movieID) {
            selectedMovieObj = movie;
            // console.log(selectedMovieObj);
          }
        }
        app.addMovieToWatchlist(selectedMovieObj);

        // show in dom that the movie has been added
        button.textContent = "added";
        button.style.backgroundColor = "green";
      } else {
        // do nothing
      }
    });
  },
  addMovieToWatchlist: (selectedMovie) => {
    if (localStorage.getItem("movieList") == null) {
      localStorage.setItem("movieList", "[]");
    }

    let watchList = JSON.parse(localStorage.getItem("movieList"));

    if (watchList.filter((e) => e.imdbID === selectedMovie.imdbID).length > 0) {
      // show that the movie is already in the list
      console.log("movie already in list");
    } else {
      watchList.push(selectedMovie);
      console.log(watchList);
      localStorage.setItem("movieList", JSON.stringify(watchList));
    }
  },
  watchList: (page) => {
    let movieList = JSON.parse(localStorage.getItem("movieList"));
    // console.log(movieList);
    if (movieList.length > 0) {
      app.renderMovies(movieList, page);
      // console.log(app.myWatchListArray);

      document.addEventListener("click", (e) => {
        const imdbID = e.target.id;

        if (imdbID) {
          for (let movie of movieList) {
            let selectedMovie = {};
            if (movie.imdbID === imdbID) {
              selectedMovie = movie;
              const index = movieList.indexOf(selectedMovie);

              console.log(index);
              if (index > -1) {
                movieList.splice(index, 1);
                movieList = localStorage.setItem(
                  "movieList",
                  JSON.stringify(movieList)
                );
              }
            }
          }

          movieList = JSON.parse(localStorage.getItem("movieList"));
          app.renderMovies(movieList, page);
          console.log(movieList.length);
        } else {
          // do nothing
        }
        console.log(imdbID);
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
                                id="${imdbID}" 
                                class ="movie-button"
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
