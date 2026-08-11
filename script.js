// WHERE TO WATCH
const platformNames = {
    netflix: "Netflix",
    juanflix: "Juanflix",
    ccp: "CCP",
    external: "External",
    none: "No known source"
};

// LAYOUT

const filmsGrid =
    document.getElementById("filmsGrid");

const yearFilter =
    document.getElementById("yearFilter");

const searchInput =
    document.getElementById("searchInput");

// LIST OF FILMS
// INFO IS LOADED FROM JSON. JSON FILE TO BE UPDATED

let films = [];


async function loadFilms() {
    try {
        const response =
            await fetch("films.json");
        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }
        films = await response.json();

        films.sort(
            (a, b) =>
                b.year - a.year
        );

        populateYears();
        renderFilms();
    }
    catch (error) {
        console.error(
            "Could not load films.json:",
            error
        );

        filmsGrid.innerHTML = `
            <div class="empty-films">
                UNABLE TO LOAD FILMS
                <br><br>
                <small>
                    Check that films.json
                    exists and is valid.
                </small>
            </div>
        `;
    }
}

function populateYears() {


    for (
        let year = 2026;
        year >= 2005;
        year--
    ) {
        const option =
            document.createElement(
                "option"
            );
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(
            option
        );
    }
}

function getFilteredFilms() {
    const selectedYear =
        yearFilter.value;

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    return films

        .filter(
            film => {
                if (
                    selectedYear === "all"
                ) {
                    return true;
                }
                return String(
                    film.year
                ) === String(
                    selectedYear
                );
            }
        )

        .filter(
            film => {

                if (
                    searchTerm === ""
                ) {
                    return true;
                }

                return film.title
                    .toLowerCase()
                    .includes(searchTerm);
            }
        )

        .sort(
            (a, b) =>
                b.year - a.year
        );

}


function createWatchOptions(
    sources
) {

    return sources
        .map(
            source => {

                const type =
                    source.type;

                const name =
                    platformNames[type]
                    || "No known source";

                if (
                    type === "external"
                    &&
                    source.url
                ) {

                    return `
                        <a
                            class="
                                platform
                                external
                            "
                            href="${source.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            ${name}
                        </a>

                    `;

                }

                return `
                    <span
                        class="
                            platform
                            ${type}
                        "
                    >
                        ${name}
                    </span>
                `;
            }
        )
        .join("");
}

function createFilmCard(
    film,
    index
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "film-card";

    const watchOptions =
        createWatchOptions(
            film.watch || []
        );

    card.innerHTML = `
        <!-- POSTER -->
        <div class="poster-wrap">
            <img
                src="${film.poster}"
                alt="${film.title}"
            >
        </div>
        <!-- FILM INFORMATION -->
        <div class="film-info">
            <!-- YEAR -->
            <div class="film-year">
                ${film.year}
            </div>
            <!-- TITLE -->
            <div class="film-title">
                ${film.title}
            </div>
            <!-- DESCRIPTION -->
            <div class="film-description">
                ${film.description}
            </div>
            <!-- CAST -->
            <div class="film-cast-label">
                CAST
            </div>
            <div class="film-cast">
                ${film.cast}
            </div>
            <!-- WHERE TO WATCH -->
            <div class="watch-label">
                Where to watch:
            </div>


            <div class="watch-options">
                ${watchOptions}
            </div>
        </div>
    `;

    const image =
        card.querySelector(
            ".poster-wrap img"
        );

    image.addEventListener(
        "error",
        function () {

            this.style.display =
                "none";

            const placeholder =
                document.createElement(
                    "div"
                );

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
    if (
        filteredFilms.length === 0
    ) {
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
            filmsGrid.appendChild(
                card
            );

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