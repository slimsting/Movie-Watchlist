const form = document.getElementById("search-form");
const APIkey = "183ac45c";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const movie = formData.get("search");
  let html = "";

  console.log(movie);

  const respose = await fetch(
    `http://www.omdbapi.com/?apikey=${APIkey}&s=${movie}`
  );
  const data = await respose.json();
  const movieList = data.Search;

  if (movieList) {
    for (let movie of movieList) {
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${APIkey}&i=${movie.imdbID}`
      );
      const data = await response.json();
      const poster = data.Poster || "";
      const title = data.Title || "";
      const rating = data.Ratings[0].Value;
      const runtime = data.Runtime || "";
      const genre = data.Genre || "";
      const plot = data.Plot || "";

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
              <button id="add-to-watchlist">+</button>
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
