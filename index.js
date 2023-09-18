const app = {
  APIkey: "183ac45c",
  myWatchListArray: [],
  searchResultsArr: [],
  init: () => {
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

      // searchResultsArr = [];
      const formData = new FormData(form);
      const userInput = formData.get("user-input");
      let resultsArr = [];
      console.log(userInput);
      // document.getElementById("user-input").value = "";

      //fetch movie list array using user input as search key

      const respose = await fetch(
        `http://www.omdbapi.com/?apikey=${app.APIkey}&s=${userInput}`
      );
      const data = await respose.json();

      const searchResults = data.Search;

      for (let movie of searchResults) {
        // console.log(movie);
        const imdbID = movie.imdbID;
        const movieUrl = `http://www.omdbapi.com/?apikey=${app.APIkey}&i=${imdbID}`;

        try {
          const response = await fetch(movieUrl);
          const data = await response.json();

          const movieObj = {
            imdbID: data.imdbID,
            poster: data.Poster,
            title: data.Title,
            rating: data.Ratings[0].Value,
            runtime: data.Runtime,
            genre: data.Genre,
            plot: data.Plot,
          };

          resultsArr.push(movieObj);
        } catch (err) {
          console.log("Err occured" + err);
        }
      }

      app.searchResultsArr = resultsArr;
      app.renderMovies(app.searchResultsArr, page);
    });

    document.addEventListener("click", (e) => {
      const imdbID = e.target.dataset.movieid;

      if (imdbID) {
        let selectedMovie = {};
        console.log(imdbID);

        for (let movie of app.searchResultsArr) {
          if (movie.imdbID === imdbID) {
            selectedMovie = movie;

            app.myWatchListArray = JSON.parse(
              localStorage.getItem("myWatchList")
            );

            if (!app.myWatchListArray.includes(selectedMovie)) {
              app.myWatchListArray.push(selectedMovie);
            } else {
              console.log("movie already in watchlist array");
            }
          }
        }

        localStorage.setItem(
          "myWatchList",
          JSON.stringify(app.myWatchListArray)
        );
      } else {
        // console.log("pop");
      }
    });
  },
  watchList: (page) => {
    app.myWatchListArray = JSON.parse(localStorage.getItem("myWatchList"));

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
