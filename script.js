const platformNames = {
    netflix: "Netflix",
    juanflix: "Juanflix",
    ccp: "CCP",
    external: "External",
    none: "No known source"
};

const filmsGrid = document.getElementById("filmsGrid");
const yearFilter = document.getElementById("yearFilter");
const searchInput = document.getElementById("searchInput");

let films = [];

async function loadFilms() {
    try {
        const response = await fetch("./films.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `films.json returned ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "films.json must contain an array of films."
            );
        }

        films = data;

        films.sort((a, b) => {
            return b.year - a.year;
        });

        populateYears();
        renderFilms();

    } catch (error) {
        console.error("FILM DATABASE ERROR:", error);

        filmsGrid.innerHTML = `
            <div class="empty-films">
                UNABLE TO LOAD FILMS
                <br><br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

function populateYears() {
    for (let year = 2026; year >= 2005; year--) {
        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        yearFilter.appendChild(option);
    }
}

function getFilteredFilms() {
    const selectedYear = yearFilter.value;

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    return films
        .filter(film => {
            if (selectedYear === "all") {
                return true;
            }

            return String(film.year) === String(selectedYear);
        })
        .filter(film => {
            if (searchTerm === "") {
                return true;
            }

            return film.title
                .toLowerCase()
                .includes(searchTerm);
        })
        .sort((a, b) => {
            return b.year - a.year;
        });
}

function createWatchOptions(sources, nowShowing) {
    let html = "";

    if (nowShowing === true) {
        html += `
            <span class="platform now-showing">
                NOW SHOWING
            </span>
        `;
    }

    if (!Array.isArray(sources)) {
        return html;
    }

    html += sources
        .map(source => {
            if (!source || !source.type) {
                return "";
            }

            const type = source.type;

            const name =
                platformNames[type] ||
                "No known source";

            if (
                type === "external" &&
                source.url
            ) {
                return `
                    <a
                        class="platform external"
                        href="${source.url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${name}
                    </a>
                `;
            }

            return `
                <span class="platform ${type}">
                    ${name}
                </span>
            `;
        })
        .join("");

    return html;
}

function createFilmCard(film, index) {
    const card = document.createElement("article");

    card.className = "film-card";

    const watchOptions = createWatchOptions(
        film.watch || [],
        film.now_showing
    );

    card.innerHTML = `
        <div class="poster-wrap">
            <img
                src="${film.poster}"
                alt="${film.title}"
            >
        </div>

        <div class="film-info">

            <div class="film-year">
                ${film.year}
            </div>

            <div class="film-title">
                ${film.title}
            </div>

            <div class="film-description">
                ${film.description || ""}
            </div>

            <div class="film-cast-label">
                DIRECTOR
            </div>

            <div class="film-cast">
                ${film.director || "Director information unavailable"}
            </div>

            <div class="film-cast-label">
                CAST
            </div>

            <div class="film-cast">
                ${film.cast || "Cast information unavailable"}
            </div>

            <div class="watch-label">
                Where to watch:
            </div>

            <div class="watch-options">
                ${watchOptions}
            </div>

        </div>
    `;

    const image = card.querySelector(
        ".poster-wrap img"
    );

    image.addEventListener(
        "error",
        function () {
            this.style.display = "none";

            const placeholder =
                document.createElement("div");

            placeholder.className =
                "poster-missing";

            placeholder.textContent =
                "POSTER NOT AVAILABLE";

            this.parentElement.appendChild(
                placeholder
            );
        }
    );

    return card;
}

function renderFilms() {
    filmsGrid.innerHTML = "";

    const filteredFilms =
        getFilteredFilms();

    if (filteredFilms.length === 0) {
        filmsGrid.innerHTML = `
            <div class="empty-films">
                NO FILMS FOUND
            </div>
        `;

        return;
    }

    filteredFilms.forEach(
        (film, index) => {
            const card =
                createFilmCard(
                    film,
                    index
                );

            filmsGrid.appendChild(card);
        }
    );
}

yearFilter.addEventListener(
    "change",
    renderFilms
);

searchInput.addEventListener(
    "input",
    renderFilms
);

loadFilms();
