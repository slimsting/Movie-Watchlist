const form = document.getElementById("search-form");
let myMovies = [];
const APIkey = "183ac45c";

//listen for a search
renderWatchlist();
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const keyWord = formData.get("search");
  let html = "";

  //   console.log(movie);

  const respose = await fetch(
    `http://www.omdbapi.com/?apikey=${APIkey}&s=${keyWord}`
  );
  const data = await respose.json();
  const movieList = data.Search;

  if (movieList) {
    for (let movie of movieList) {
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${APIkey}&i=${movie.imdbID}`
      );
      const data = await response.json();
      const poster = data.Poster;
      const title = data.Title;
      const rating = data.Ratings[0].Value;
      const runtime = data.Runtime;
      const genre = data.Genre;
      const plot = data.Plot;
      const imdbID = data.imdbID;

      html += `
        <div class="movie-container">
              <img
                alt=" ${title}movie-poster"
                class="movie-poster"
                src="${poster}"
              />
              <div class="movie-details">
                <h2>${title} ⭐ ${rating}</h2>
                <h3>${runtime} ${genre}.</h3>
                <p>
                 ${plot}
                </p>
              </div>
              <span id="add-to-watchlist" data-imdbadd="${imdbID}">+</span>
            </div>
        `;
    }
    document.getElementById("search").value = "";
    document.getElementById("movies-list-container").innerHTML = html;
  } else {
    document.getElementById("search").value = "";
    document.getElementById(
      "movies-list-container"
    ).innerHTML = `<h4 id="no-results">Unable to find what you are looking for. Please try another search</h4>`;
  }
});

document.addEventListener("click", async (e) => {
  console.log(e.target.dataset.imdbadd);
  console.log(e.target.dataset.imdbremove);
  if (e.target.dataset.imdbadd) {
    const movieID = e.target.dataset.imdbadd;

    // console.log(movieID);
    if (myMovies.includes(movieID)) {
      console.log("already iiiinnnnn");
    } else {
      myMovies.push(movieID);
      let string = JSON.stringify(myMovies);
      localStorage.setItem("MyMovieList", string);
      renderWatchlist();
    }
  } else if (e.target.dataset.imdbremove) {
    const movieID = e.target.dataset.imdbremove;
    const index = movieID.indexOf(movieID);
    if (index > -1) {
      myMovies.splice(index, 1);
    }
    let string = JSON.stringify(myMovies);
    localStorage.setItem("MyMovieList", string);
    renderWatchlist();
  }
});

async function renderWatchlist() {
  let movieList = localStorage.getItem("MyMovieList");
  const movieIDs = JSON.parse(movieList);
  let html2 = "";

  if (movieIDs) {
    for (let movieID of movieIDs) {
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${APIkey}&i=${movieID}`
      );
      const data = await response.json();

      const poster = data.Poster;
      const title = data.Title;
      const rating = data.Ratings[0].Value;
      const runtime = data.Runtime;
      const genre = data.Genre;
      const plot = data.Plot;
      const imdbID = data.imdbID;

      html2 += `
        <div class="movie-container">
              <img
                alt=" ${title}movie-poster"
                class="movie-poster"
                src="${poster}"
              />
              <div class="movie-details">
                <h2>${title} ⭐ ${rating}</h2>
                <h3>${runtime} ${genre}.</h3>
                <p>
                 ${plot}
                </p>
              </div>
              <span id="remove-from-watchlist" data-imdbremove="${imdbID}">-</span>
            </div>
        `;
    }
    document.getElementById("movies-list-container2").innerHTML = html2;
  } else {
    document.getElementById(
      "movies-list-container2"
    ).innerHTML = `<h4 id="no-results">Your watchlist is looking a little empty...</h4>`;
  }
}
