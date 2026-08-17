const platformNames = {
    netflix: "Netflix",
    juanflix: "Juanflix",
    ccp: "CCP",
    youtube: "YouTube",
    prime: "Prime Video",
    appletv: "Apple TV",
    iwant: "iWant",
    viva: "VivaOne",
    external: "External",
    none: "No known source"
};


const filmsGrid =
    document.getElementById("filmsGrid");

const pagination =
    document.getElementById("pagination");

const yearFilter =
    document.getElementById("yearFilter");

const watchFilter =
    document.getElementById("watchFilter");

const searchInput =
    document.getElementById("searchInput");


/* =========================================================
   NAVIGATION
   ========================================================= */

const homeButton =
    document.getElementById("homeButton");

const castButton =
    document.getElementById("castButton");

const directorsButton =
    document.getElementById("directorsButton");

const findPeopleButton =
    document.getElementById("findPeopleButton");

const filmographyButton =
    document.getElementById("filmographyButton");


/* =========================================================
   SECTIONS
   ========================================================= */

const filmsSection =
    document.getElementById("filmsSection");

const filmControls =
    document.getElementById("filmControls");

const castSection =
    document.getElementById("castSection");

const castRanking =
    document.getElementById("castRanking");

const directorsSection =
    document.getElementById("directorsSection");

const directorsRanking =
    document.getElementById("directorsRanking");


/* =========================================================
   DEVELOPER MODAL
   ========================================================= */

const developerModal =
    document.getElementById("developerModal");

const developerClose =
    document.getElementById("developerClose");


/* =========================================================
   COMMON FILMS
   ========================================================= */

const commonFilmsModal =
    document.getElementById("commonFilmsModal");

const commonFilmsClose =
    document.getElementById("commonFilmsClose");

const findCommonFilmsButton =
    document.getElementById("findCommonFilms");

const commonFilmsResults =
    document.getElementById("commonFilmsResults");


/* =========================================================
   COMMON FILMS INPUTS
   ========================================================= */

const personOne =
    document.getElementById("personOne");

const personTwo =
    document.getElementById("personTwo");

const personOneSuggestions =
    document.getElementById(
        "personOneSuggestions"
    );

const personTwoSuggestions =
    document.getElementById(
        "personTwoSuggestions"
    );


/* =========================================================
   FILMOGRAPHY
   ========================================================= */

const filmographyModal =
    document.getElementById(
        "filmographyModal"
    );

const filmographyClose =
    document.getElementById(
        "filmographyClose"
    );

const filmographyPerson =
    document.getElementById(
        "filmographyPerson"
    );

const filmographySuggestions =
    document.getElementById(
        "filmographySuggestions"
    );

const filmographyResults =
    document.getElementById(
        "filmographyResults"
    );

const findFilmographyButton =
    document.getElementById(
        "findFilmography"
    );


/* =========================================================
   FILM DETAILS MODAL
   ========================================================= */

const filmDetailsModal =
    document.getElementById(
        "filmDetailsModal"
    );

const filmDetailsClose =
    document.getElementById(
        "filmDetailsClose"
    );

const filmDetailsHeader =
    document.getElementById(
        "filmDetailsHeader"
    );

const filmDetailsPoster =
    document.getElementById(
        "filmDetailsPoster"
    );

const filmDetailsBasic =
    document.getElementById(
        "filmDetailsBasic"
    );

const filmDetailsSynopsis =
    document.getElementById(
        "filmDetailsSynopsis"
    );

const filmDetailsPeople =
    document.getElementById(
        "filmDetailsPeople"
    );

const filmDetailsProduction =
    document.getElementById(
        "filmDetailsProduction"
    );

const filmDetailsWatch =
    document.getElementById(
        "filmDetailsWatch"
    );

const filmDetailsAwards =
    document.getElementById(
        "filmDetailsAwards"
    );


/* =========================================================
   THEME
   ========================================================= */

const themeToggle =
    document.getElementById(
        "themeToggle"
    );

const themeLabel =
    document.getElementById(
        "themeLabel"
    );


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let films = [];

let currentPage = 1;

const filmsPerPage = 15;


/* =========================================================
   AWARD NAMES
   ========================================================= */

const awardNames = {

    film:
        "Best Film",

    special_jury:
        "Special Jury Award",

    audience:
        "Audience Choice Award",

    direction:
        "Best Direction",

    actor:
        "Best Actor",

    actress:
        "Best Actress",

    supporting_actor:
        "Best Supporting Actor",

    supporting_actress:
        "Best Supporting Actress",

    screenplay:
        "Best Screenplay",

    cinematography:
        "Best Cinematography",

    editing:
        "Best Editing",

    sound:
        "Best Sound",

    music:
        "Best Original Music Score",

    production:
        "Best Production Design"

};
/* =========================================================
   LOAD FILMS
   ========================================================= */

async function loadFilms() {

    try {

        const response =
            await fetch(
                "./films.json",
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `films.json returned ${response.status} ${response.statusText}`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(
                data
            )
        ) {

            throw new Error(
                "films.json must contain an array of films."
            );

        }


        films = data;


        /*
         * Newest year first.
         * Within the same year:
         * alphabetical by title.
         */

        films.sort(
            (a, b) => {

                if (
                    Number(
                        a.year
                    ) !==
                    Number(
                        b.year
                    )
                ) {

                    return (
                        Number(
                            b.year
                        ) -
                        Number(
                            a.year
                        )
                    );

                }


                return String(
                    a.title || ""
                ).localeCompare(
                    String(
                        b.title || ""
                    ),
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );


        populateYears();

        populateWatchFilters();

        buildCastRanking();

        buildDirectorsRanking();


        currentPage =
            1;


        renderFilms();


    } catch (
    error
    ) {

        console.error(
            "Error loading films:",
            error
        );


        if (
            filmsGrid
        ) {

            filmsGrid.innerHTML = `

                <div
                    class="empty-films"
                >

                    UNABLE TO LOAD FILMS

                    <br>
                    <br>

                    <small>
                        ${escapeHTML(
                error.message
            )}
                    </small>

                </div>

            `;

        }


        if (
            pagination
        ) {

            pagination.innerHTML =
                "";

        }

    }

}


/* =========================================================
   POPULATE YEARS
   ========================================================= */

function populateYears() {

    if (
        !yearFilter
    ) {

        return;

    }


    yearFilter.innerHTML = `

        <option value="all">
            ALL YEARS
        </option>

    `;


    const years =
        [
            ...new Set(
                films
                    .map(
                        film =>
                            Number(
                                film.year
                            )
                    )
                    .filter(
                        year =>
                            !Number.isNaN(
                                year
                            )
                    )
            )
        ]
            .sort(
                (a, b) =>
                    b - a
            );


    years.forEach(
        year => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;


            option.textContent =
                year;


            yearFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   POPULATE WATCH FILTER
   ========================================================= */

function populateWatchFilters() {

    if (
        !watchFilter
    ) {

        return;

    }


    watchFilter.innerHTML = `

        <option value="all">
            WHERE TO WATCH
        </option>

    `;


    const platforms = [

        [
            "netflix",
            "Netflix"
        ],

        [
            "juanflix",
            "Juanflix"
        ],

        [
            "ccp",
            "CCP"
        ],

        [
            "youtube",
            "YouTube"
        ],

        [
            "prime",
            "Prime Video"
        ],

        [
            "appletv",
            "Apple TV"
        ],

        [
            "iwant",
            "iWant"
        ],

        [
            "viva",
            "VivaOne"
        ],

        [
            "external",
            "External"
        ],

        [
            "none",
            "No known source"
        ],

        [
            "now_showing",
            "Now Showing"
        ]

    ];


    platforms.forEach(
        (
            [
                value,
                label
            ]
        ) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                value;


            option.textContent =
                label;


            watchFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   FILTER FILMS
   ========================================================= */

function getFilteredFilms() {

    const selectedYear =
        yearFilter
            ? yearFilter.value
            : "all";


    const selectedWatch =
        watchFilter
            ? watchFilter.value
            : "all";


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    return films

        /* YEAR */

        .filter(
            film => {

                if (
                    selectedYear ===
                    "all"
                ) {

                    return true;

                }


                return (
                    String(
                        film.year
                    ) ===
                    String(
                        selectedYear
                    )
                );

            }
        )


        /* WATCH */

        .filter(
            film => {

                if (
                    selectedWatch ===
                    "all"
                ) {

                    return true;

                }


                if (
                    selectedWatch ===
                    "now_showing"
                ) {

                    return (
                        film.now_showing ===
                        true
                    );

                }


                if (
                    !Array.isArray(
                        film.watch
                    )
                ) {

                    return false;

                }


                return film.watch.some(
                    source =>
                        source &&
                        source.type ===
                        selectedWatch
                );

            }
        )


        /* SEARCH */

        .filter(
            film => {

                if (
                    !searchTerm
                ) {

                    return true;

                }


                return String(
                    film.title || ""
                )
                    .toLowerCase()
                    .includes(
                        searchTerm
                    );

            }
        )


        /* SORT */

        .sort(
            (a, b) => {

                /*
                 * If a specific year is selected,
                 * alphabetize the films.
                 */

                if (
                    selectedYear !==
                    "all"
                ) {

                    return String(
                        a.title || ""
                    ).localeCompare(
                        String(
                            b.title || ""
                        ),
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }


                /*
                 * Otherwise newest year first,
                 * then alphabetical.
                 */

                if (
                    Number(
                        a.year
                    ) !==
                    Number(
                        b.year
                    )
                ) {

                    return (
                        Number(
                            b.year
                        ) -
                        Number(
                            a.year
                        )
                    );

                }


                return String(
                    a.title || ""
                ).localeCompare(
                    String(
                        b.title || ""
                    ),
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   FORMAT NAME
   ========================================================= */

function formatName(
    name
) {

    return String(
        name || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   GET CAST NAMES
   ========================================================= */

function getCastNames(
    cast
) {

    if (
        !cast
    ) {

        return [];

    }


    if (
        Array.isArray(
            cast
        )
    ) {

        return cast

            .flatMap(
                name =>
                    String(
                        name
                    ).split(
                        /,|&/
                    )
            )

            .map(
                name =>
                    name.trim()
            )

            .filter(
                Boolean
            );

    }


    return String(
        cast
    )

        .split(
            /,|&/
        )

        .map(
            name =>
                name.trim()
        )

        .filter(
            Boolean
        );

}


/* =========================================================
   GET DIRECTOR NAMES
   ========================================================= */

function getDirectorNames(
    director
) {

    if (
        !director
    ) {

        return [];

    }


    if (
        Array.isArray(
            director
        )
    ) {

        return director

            .flatMap(
                name =>
                    String(
                        name
                    ).split(
                        /,|&/
                    )
            )

            .map(
                name =>
                    name.trim()
            )

            .filter(
                Boolean
            );

    }


    return String(
        director
    )

        .split(
            /,|&/
        )

        .map(
            name =>
                name.trim()
        )

        .filter(
            Boolean
        );

}


/* =========================================================
   GENERIC PEOPLE VALUE
   Used for production credits.
   ========================================================= */

function getPeopleNames(
    value
) {

    if (
        !value
    ) {

        return [];

    }


    if (
        Array.isArray(
            value
        )
    ) {

        return value

            .flatMap(
                item => {

                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        return (
                            item.name ||
                            item.value ||
                            ""
                        );

                    }


                    return String(
                        item
                    );

                }
            )

            .flatMap(
                item =>
                    String(
                        item
                    ).split(
                        /,|&/
                    )
            )

            .map(
                item =>
                    item.trim()
            )

            .filter(
                Boolean
            );

    }


    if (
        typeof value ===
        "object"
    ) {

        if (
            value.name
        ) {

            return getPeopleNames(
                value.name
            );

        }


        if (
            value.value
        ) {

            return getPeopleNames(
                value.value
            );

        }

    }


    return String(
        value
    )

        .split(
            /,|&/
        )

        .map(
            item =>
                item.trim()
        )

        .filter(
            Boolean
        );

}
/* =========================================================
   RENDER FILMS
   ========================================================= */

function renderFilms() {

    if (
        !filmsGrid
    ) {

        return;

    }


    const filteredFilms =
        getFilteredFilms();


    const totalPages =
        Math.ceil(
            filteredFilms.length /
            filmsPerPage
        );


    if (
        currentPage >
        totalPages &&
        totalPages > 0
    ) {

        currentPage =
            totalPages;

    }


    const startIndex =
        (
            currentPage -
            1
        ) *
        filmsPerPage;


    const pageFilms =
        filteredFilms.slice(
            startIndex,
            startIndex +
            filmsPerPage
        );


    filmsGrid.innerHTML =
        "";


    if (
        pageFilms.length ===
        0
    ) {

        filmsGrid.innerHTML = `

            <div
                class="empty-films"
            >
                NO FILMS FOUND
            </div>

        `;


        renderPagination(
            0
        );


        return;

    }


    pageFilms.forEach(
        film => {

            filmsGrid.appendChild(
                createFilmCard(
                    film
                )
            );

        }
    );


    renderPagination(
        totalPages
    );

}


/* =========================================================
   CREATE FILM CARD
   ========================================================= */

function createFilmCard(
    film
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "film-card";


    card.dataset.filmId =
        film.id || "";


    /*
     * POSTER
     */

    const posterWrap =
        document.createElement(
            "div"
        );


    posterWrap.className =
        "poster-wrap";


    const poster =
        document.createElement(
            "img"
        );


    poster.src =
        film.poster || "";


    poster.alt =
        film.title || "";


    poster.loading =
        "lazy";


    posterWrap.appendChild(
        poster
    );


    poster.addEventListener(
        "error",
        function () {

            this.style.display =
                "none";


            if (
                posterWrap.querySelector(
                    ".poster-missing"
                )
            ) {

                return;

            }


            const missing =
                document.createElement(
                    "div"
                );


            missing.className =
                "poster-missing";


            missing.textContent =
                "POSTER NOT AVAILABLE";


            posterWrap.appendChild(
                missing
            );

        }
    );


    /*
     * FILM INFO
     */

    const info =
        document.createElement(
            "div"
        );


    info.className =
        "film-info";


    /*
     * YEAR
     */

    const year =
        document.createElement(
            "div"
        );


    year.className =
        "film-year";


    year.textContent =
        film.year || "";


    info.appendChild(
        year
    );


    /*
     * TITLE
     */

    const title =
        document.createElement(
            "div"
        );


    title.className =
        "film-title";


    title.textContent =
        film.title ||
        "Untitled";


    info.appendChild(
        title
    );


    /*
     * DESCRIPTION
     */

    const description =
        document.createElement(
            "div"
        );


    description.className =
        "film-description";


    description.textContent =
        film.description ||
        "No synopsis available.";


    info.appendChild(
        description
    );


    /*
     * DIRECTOR
     */

    const directorLabel =
        document.createElement(
            "div"
        );


    directorLabel.className =
        "film-director-label";


    directorLabel.textContent =
        "DIRECTOR";


    info.appendChild(
        directorLabel
    );


    const directorWrap =
        document.createElement(
            "div"
        );


    directorWrap.className =
        "film-director";


    const directors =
        getDirectorNames(
            film.director
        );


    if (
        directors.length
    ) {

        directors.forEach(
            director => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "director-tag";


                tag.textContent =
                    director;


                directorWrap.appendChild(
                    tag
                );

            }
        );

    } else {

        const unavailable =
            document.createElement(
                "span"
            );


        unavailable.className =
            "director-unavailable";


        unavailable.textContent =
            "Not available";


        directorWrap.appendChild(
            unavailable
        );

    }


    info.appendChild(
        directorWrap
    );


    /*
     * CAST
     */

    const castLabel =
        document.createElement(
            "div"
        );


    castLabel.className =
        "film-cast-label";


    castLabel.textContent =
        "CAST";


    info.appendChild(
        castLabel
    );


    const castWrap =
        document.createElement(
            "div"
        );


    castWrap.className =
        "film-cast";


    const cast =
        getCastNames(
            film.cast
        );


    if (
        cast.length
    ) {

        cast.forEach(
            person => {

                const tag =
                    document.createElement(
                        "span"
                    );


                tag.className =
                    "cast-tag";


                tag.textContent =
                    person;


                castWrap.appendChild(
                    tag
                );

            }
        );

    } else {

        const unavailable =
            document.createElement(
                "span"
            );


        unavailable.className =
            "cast-unavailable";


        unavailable.textContent =
            "Not available";


        castWrap.appendChild(
            unavailable
        );

    }


    info.appendChild(
        castWrap
    );


    /*
     * WHERE TO WATCH
     */

    const watchLabel =
        document.createElement(
            "div"
        );


    watchLabel.className =
        "watch-label";


    watchLabel.textContent =
        "WHERE TO WATCH";


    info.appendChild(
        watchLabel
    );


    const watchOptions =
        document.createElement(
            "div"
        );


    watchOptions.className =
        "watch-options";


    const watchSources =
        Array.isArray(
            film.watch
        )
            ? film.watch
            : [];


    if (
        film.now_showing ===
        true
    ) {

        const nowShowing =
            document.createElement(
                "span"
            );


        nowShowing.className =
            "platform now-showing";


        nowShowing.textContent =
            "NOW SHOWING";


        watchOptions.appendChild(
            nowShowing
        );

    }


    watchSources.forEach(
        source => {

            if (
                !source
            ) {

                return;

            }


            /*
             * Support both:
             *
             * "netflix"
             *
             * and:
             *
             * {
             *     type: "netflix",
             *     url: "..."
             * }
             */

            const type =
                typeof source ===
                    "string"
                    ? source
                    : source.type;


            if (
                !type
            ) {

                return;

            }


            const normalized =
                String(
                    type
                )
                    .toLowerCase()
                    .trim();


            const label =
                platformNames[
                normalized
                ] ||
                normalized
                    .replace(
                        /_/g,
                        " "
                    )
                    .toUpperCase();


            const element =
                document.createElement(
                    source.url
                        ? "a"
                        : "span"
                );


            element.className =
                `platform ${normalized}`;


            element.textContent =
                label;


            if (
                source.url
            ) {

                element.href =
                    source.url;


                element.target =
                    "_blank";


                element.rel =
                    "noopener noreferrer";


                element.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                    }
                );

            }


            watchOptions.appendChild(
                element
            );

        }
    );


    if (
        !watchOptions.children.length
    ) {

        const none =
            document.createElement(
                "span"
            );


        none.className =
            "platform none";


        none.textContent =
            "NO KNOWN SOURCE";


        watchOptions.appendChild(
            none
        );

    }


    info.appendChild(
        watchOptions
    );


    /*
     * APPEND
     */

    card.appendChild(
        posterWrap
    );


    card.appendChild(
        info
    );


    /*
     * CARD CLICK
     */

    card.addEventListener(
        "click",
        () => {

            openFilmDetails(
                film
            );

        }
    );


    return card;

}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination(
    totalPages
) {

    if (
        !pagination
    ) {

        return;

    }


    pagination.innerHTML =
        "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    /*
     * PREVIOUS
     */

    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.textContent =
        "‹";


    previous.disabled =
        currentPage <= 1;


    previous.addEventListener(
        "click",
        () => {

            if (
                currentPage <= 1
            ) {

                return;

            }


            currentPage--;


            renderFilms();


            window.scrollTo({
                top: 0,
                behavior:
                    "smooth"
            });

        }
    );


    pagination.appendChild(
        previous
    );


    /*
     * PAGE NUMBERS
     */

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            page;


        if (
            page ===
            currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;


                renderFilms();


                window.scrollTo({
                    top: 0,
                    behavior:
                        "smooth"
                });

            }
        );


        pagination.appendChild(
            button
        );

    }


    /*
     * NEXT
     */

    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.textContent =
        "›";


    next.disabled =
        currentPage >=
        totalPages;


    next.addEventListener(
        "click",
        () => {

            if (
                currentPage >=
                totalPages
            ) {

                return;

            }


            currentPage++;


            renderFilms();


            window.scrollTo({
                top: 0,
                behavior:
                    "smooth"
            });

        }
    );


    pagination.appendChild(
        next
    );

}
/* =========================================================
   CAST RANKING
   ========================================================= */

function buildCastRanking() {

    if (
        !castRanking
    ) {

        return;

    }


    const counts =
        new Map();


    films.forEach(
        film => {

            const seen =
                new Set();


            const cast =
                getCastNames(
                    film.cast
                );


            cast.forEach(
                name => {

                    const normalized =
                        formatName(
                            name
                        );


                    if (
                        !normalized ||
                        seen.has(
                            normalized
                        )
                    ) {

                        return;

                    }


                    seen.add(
                        normalized
                    );


                    if (
                        !counts.has(
                            normalized
                        )
                    ) {

                        counts.set(
                            normalized,
                            {
                                name:
                                    name,
                                count:
                                    0
                            }
                        );

                    }


                    counts.get(
                        normalized
                    ).count++;

                }
            );

        }
    );


    /*
     * Show everyone with more than
     * one Cinemalaya film.
     */

    const ranking =
        Array.from(
            counts.values()
        )
            .filter(
                person =>
                    person.count >
                    1
            )
            .sort(
                (a, b) => {

                    if (
                        b.count !==
                        a.count
                    ) {

                        return (
                            b.count -
                            a.count
                        );

                    }


                    return a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );


    castRanking.innerHTML =
        "";


    if (
        ranking.length ===
        0
    ) {

        castRanking.innerHTML = `

            <div
                class="empty-films"
            >
                NO CAST MEMBERS WITH
                MORE THAN ONE FILM.
            </div>

        `;

        return;

    }


    ranking.forEach(
        (
            person,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "cast-ranking-card";


            card.innerHTML = `

                <div
                    class="cast-rank"
                >
                    ${index + 1}
                </div>


                <div
                    class="cast-name"
                >
                    ${escapeHTML(
                person.name
            )}
                </div>


                <div
                    class="cast-film-count"
                >
                    ${person.count}
                    ${person.count ===
                    1
                    ? "FILM"
                    : "FILMS"
                }
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openFilmographyForPerson(
                        person.name
                    );

                }
            );


            castRanking.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DIRECTORS RANKING
   ========================================================= */

function buildDirectorsRanking() {

    if (
        !directorsRanking
    ) {

        return;

    }


    const counts =
        new Map();


    films.forEach(
        film => {

            const seen =
                new Set();


            const directors =
                getDirectorNames(
                    film.director
                );


            directors.forEach(
                name => {

                    const normalized =
                        formatName(
                            name
                        );


                    if (
                        !normalized ||
                        seen.has(
                            normalized
                        )
                    ) {

                        return;

                    }


                    seen.add(
                        normalized
                    );


                    if (
                        !counts.has(
                            normalized
                        )
                    ) {

                        counts.set(
                            normalized,
                            {
                                name:
                                    name,
                                count:
                                    0
                            }
                        );

                    }


                    counts.get(
                        normalized
                    ).count++;

                }
            );

        }
    );


    /*
     * Show all directors with
     * more than one film.
     */

    const ranking =
        Array.from(
            counts.values()
        )
            .filter(
                director =>
                    director.count >
                    1
            )
            .sort(
                (a, b) => {

                    if (
                        b.count !==
                        a.count
                    ) {

                        return (
                            b.count -
                            a.count
                        );

                    }


                    return a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );

                }
            );


    directorsRanking.innerHTML =
        "";


    if (
        ranking.length ===
        0
    ) {

        directorsRanking.innerHTML = `

            <div
                class="empty-films"
            >
                NO DIRECTORS WITH
                MORE THAN ONE FILM.
            </div>

        `;

        return;

    }


    ranking.forEach(
        (
            director,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "cast-ranking-card";


            card.innerHTML = `

                <div
                    class="cast-rank"
                >
                    ${index + 1}
                </div>


                <div
                    class="cast-name"
                >
                    ${escapeHTML(
                director.name
            )}
                </div>


                <div
                    class="cast-film-count"
                >
                    ${director.count}
                    ${director.count ===
                    1
                    ? "FILM"
                    : "FILMS"
                }
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    showDirectorFilmography(
                        director.name
                    );

                }
            );


            directorsRanking.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   GET ALL CAST NAMES
   ========================================================= */

function getAllCastNames() {

    const names =
        new Map();


    films.forEach(
        film => {

            const cast =
                getCastNames(
                    film.cast
                );


            cast.forEach(
                name => {

                    const normalized =
                        formatName(
                            name
                        );


                    if (
                        !normalized
                    ) {

                        return;

                    }


                    if (
                        !names.has(
                            normalized
                        )
                    ) {

                        names.set(
                            normalized,
                            name
                        );

                    }

                }
            );

        }
    );


    return Array.from(
        names.values()
    ).sort(
        (a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity:
                        "base"
                }
            )
    );

}


/* =========================================================
   GET CAST SUGGESTIONS
   ========================================================= */

function getCastSuggestions(
    query
) {

    const search =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (
        !search
    ) {

        return [];

    }


    return getAllCastNames()
        .filter(
            name =>
                name
                    .toLowerCase()
                    .includes(
                        search
                    )
        )
        .slice(
            0,
            10
        );

}


/* =========================================================
   SHOW CAST SUGGESTIONS
   ========================================================= */

function showCastSuggestions(
    input,
    container
) {

    if (
        !input ||
        !container
    ) {

        return;

    }


    const matches =
        getCastSuggestions(
            input.value
        );


    container.innerHTML =
        "";


    if (
        !matches.length
    ) {

        container.classList.remove(
            "active"
        );

        return;

    }


    matches.forEach(
        name => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "person-suggestion";


            button.textContent =
                name;


            button.addEventListener(
                "mousedown",
                event => {

                    event.preventDefault();

                }
            );


            button.addEventListener(
                "click",
                () => {

                    input.value =
                        name;


                    container.classList.remove(
                        "active"
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    container.classList.add(
        "active"
    );

}


/* =========================================================
   GET DIRECTOR FILMS
   ========================================================= */

function getDirectorFilms(
    name
) {

    const normalized =
        formatName(
            name
        );


    return films.filter(
        film => {

            const directors =
                getDirectorNames(
                    film.director
                );


            return directors.some(
                director =>
                    formatName(
                        director
                    ) ===
                    normalized
            );

        }
    );

}


/* =========================================================
   SHOW DIRECTOR FILMOGRAPHY
   ========================================================= */

function showDirectorFilmography(
    name
) {

    if (
        !filmographyModal ||
        !filmographyPerson ||
        !filmographyResults
    ) {

        return;

    }


    filmographyPerson.value =
        name;


    filmographyModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    const matches =
        getDirectorFilms(
            name
        );


    filmographyResults.innerHTML =
        "";


    if (
        !matches.length
    ) {

        filmographyResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                NO FILMS FOUND
            </div>

        `;

        return;

    }


    filmographyResults.innerHTML = `

        <div
            class="filmography-count"
        >
            ${matches.length}
            ${matches.length ===
            1
            ? "FILM"
            : "FILMS"
        }
        </div>

    `;


    matches.forEach(
        film => {

            const result =
                document.createElement(
                    "div"
                );


            result.className =
                "filmography-result";


            result.innerHTML = `

                <div
                    class="filmography-poster"
                >

                    <img
                        src="${escapeHTML(
                film.poster ||
                ""
            )}"
                        alt="${escapeHTML(
                film.title ||
                ""
            )}"
                    >

                </div>


                <div>

                    <div
                        class="filmography-year"
                    >
                        ${escapeHTML(
                film.year ||
                ""
            )}
                    </div>


                    <div
                        class="filmography-title"
                    >
                        ${escapeHTML(
                film.title ||
                "Untitled"
            )}
                    </div>


                    <span
                        class="filmography-role"
                    >
                        DIRECTOR
                    </span>

                </div>

            `;


            result.addEventListener(
                "click",
                () => {

                    closeFilmography();

                    openFilmDetails(
                        film
                    );

                }
            );


            filmographyResults.appendChild(
                result
            );

        }
    );

}
/* =========================================================
   COMMON FILMS
   ========================================================= */

function findCommonFilms() {

    if (
        !personOne ||
        !personTwo ||
        !commonFilmsResults
    ) {

        return;

    }


    const nameOne =
        formatName(
            personOne.value
        );


    const nameTwo =
        formatName(
            personTwo.value
        );


    if (
        !nameOne ||
        !nameTwo
    ) {

        commonFilmsResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                PLEASE ENTER TWO NAMES
            </div>

        `;

        return;

    }


    if (
        nameOne ===
        nameTwo
    ) {

        commonFilmsResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                PLEASE ENTER TWO DIFFERENT NAMES
            </div>

        `;

        return;

    }


    const common =
        films.filter(
            film => {

                const cast =
                    getCastNames(
                        film.cast
                    );


                const normalizedCast =
                    cast.map(
                        name =>
                            formatName(
                                name
                            )
                    );


                return (
                    normalizedCast.includes(
                        nameOne
                    ) &&
                    normalizedCast.includes(
                        nameTwo
                    )
                );

            }
        );


    /*
     * Newest first.
     */

    common.sort(
        (a, b) => {

            if (
                Number(
                    a.year
                ) !==
                Number(
                    b.year
                )
            ) {

                return (
                    Number(
                        b.year
                    ) -
                    Number(
                        a.year
                    )
                );

            }


            return String(
                a.title || ""
            ).localeCompare(
                String(
                    b.title || ""
                ),
                undefined,
                {
                    sensitivity:
                        "base"
                }
            );

        }
    );


    renderCommonFilms(
        common
    );

}


/* =========================================================
   RENDER COMMON FILMS
   ========================================================= */

function renderCommonFilms(
    common
) {

    if (
        !commonFilmsResults
    ) {

        return;

    }


    commonFilmsResults.innerHTML =
        "";


    if (
        !common.length
    ) {

        commonFilmsResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                NO COMMON FILMS FOUND
            </div>

        `;

        return;

    }


    common.forEach(
        film => {

            const result =
                document.createElement(
                    "div"
                );


            result.className =
                "common-film-result";


            result.innerHTML = `

                <div
                    class="common-film-poster"
                >

                    <img
                        src="${escapeHTML(
                film.poster ||
                ""
            )}"
                        alt="${escapeHTML(
                film.title ||
                ""
            )}"
                    >

                </div>


                <div>

                    <div
                        class="common-film-year"
                    >
                        ${escapeHTML(
                film.year ||
                ""
            )}
                    </div>


                    <div
                        class="common-film-title"
                    >
                        ${escapeHTML(
                film.title ||
                "Untitled"
            )}
                    </div>


                    <div
                        class="common-film-people"
                    >

                        <span
                            class="common-film-person"
                        >
                            ${escapeHTML(
                personOne.value.trim()
            )}
                        </span>


                        <span
                            class="common-film-person"
                        >
                            ${escapeHTML(
                personTwo.value.trim()
            )}
                        </span>

                    </div>

                </div>

            `;


            result.style.cursor =
                "pointer";


            result.addEventListener(
                "click",
                () => {

                    closeCommonFilms();

                    openFilmDetails(
                        film
                    );

                }
            );


            commonFilmsResults.appendChild(
                result
            );

        }
    );

}


/* =========================================================
   FILMOGRAPHY
   ========================================================= */

function findFilmography() {

    if (
        !filmographyPerson ||
        !filmographyResults
    ) {

        return;

    }


    const searchName =
        filmographyPerson.value.trim();


    if (
        !searchName
    ) {

        filmographyResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                PLEASE ENTER A NAME
            </div>

        `;

        return;

    }


    const normalized =
        formatName(
            searchName
        );


    const matches =
        films.filter(
            film => {

                const cast =
                    getCastNames(
                        film.cast
                    );


                return cast.some(
                    name =>
                        formatName(
                            name
                        ) ===
                        normalized
                );

            }
        );


    matches.sort(
        (a, b) => {

            if (
                Number(
                    a.year
                ) !==
                Number(
                    b.year
                )
            ) {

                return (
                    Number(
                        b.year
                    ) -
                    Number(
                        a.year
                    )
                );

            }


            return String(
                a.title || ""
            ).localeCompare(
                String(
                    b.title || ""
                ),
                undefined,
                {
                    sensitivity:
                        "base"
                }
            );

        }
    );


    renderFilmography(
        matches,
        searchName
    );

}


/* =========================================================
   RENDER FILMOGRAPHY
   ========================================================= */

function renderFilmography(
    matches,
    searchName
) {

    if (
        !filmographyResults
    ) {

        return;

    }


    filmographyResults.innerHTML =
        "";


    if (
        !matches.length
    ) {

        filmographyResults.innerHTML = `

            <div
                class="common-films-empty"
            >
                NO FILMOGRAPHY FOUND
            </div>

        `;

        return;

    }


    const count =
        document.createElement(
            "div"
        );


    count.className =
        "filmography-count";


    count.textContent =
        `${matches.length} ${matches.length === 1
            ? "FILM"
            : "FILMS"
        }`;


    filmographyResults.appendChild(
        count
    );


    matches.forEach(
        film => {

            const result =
                document.createElement(
                    "div"
                );


            result.className =
                "filmography-result";


            result.innerHTML = `

                <div
                    class="filmography-poster"
                >

                    <img
                        src="${escapeHTML(
                film.poster ||
                ""
            )}"
                        alt="${escapeHTML(
                film.title ||
                ""
            )}"
                        loading="lazy"
                    >

                </div>


                <div>

                    <div
                        class="filmography-year"
                    >
                        ${escapeHTML(
                film.year ||
                ""
            )}
                    </div>


                    <div
                        class="filmography-title"
                    >
                        ${escapeHTML(
                film.title ||
                "Untitled"
            )}
                    </div>


                    <span
                        class="filmography-role"
                    >
                        ${escapeHTML(
                getFilmographyRole(
                    film,
                    searchName
                )
            )}
                    </span>

                </div>

            `;


            result.addEventListener(
                "click",
                () => {

                    closeFilmography();

                    openFilmDetails(
                        film
                    );

                }
            );


            filmographyResults.appendChild(
                result
            );

        }
    );

}


/* =========================================================
   GET FILMOGRAPHY ROLE
   ========================================================= */

function getFilmographyRole(
    film,
    searchName
) {

    const normalized =
        formatName(
            searchName
        );


    const cast =
        getCastNames(
            film.cast
        );


    /*
     * If the JSON cast item contains
     * role information, use it.
     */

    if (
        Array.isArray(
            film.cast
        )
    ) {

        const match =
            film.cast.find(
                person => {

                    if (
                        typeof person ===
                        "string"
                    ) {

                        return (
                            formatName(
                                person
                            ) ===
                            normalized
                        );

                    }


                    if (
                        person &&
                        typeof person ===
                        "object"
                    ) {

                        return (
                            formatName(
                                person.name ||
                                ""
                            ) ===
                            normalized
                        );

                    }


                    return false;

                }
            );


        if (
            match &&
            typeof match ===
            "object"
        ) {

            if (
                match.role
            ) {

                return match.role;

            }


            if (
                match.character
            ) {

                return match.character;

            }

        }

    }


    if (
        cast.some(
            name =>
                formatName(
                    name
                ) ===
                normalized
        )
    ) {

        return "CAST";

    }


    return "CAST";

}


/* =========================================================
   OPEN FILMOGRAPHY FOR PERSON
   ========================================================= */

function openFilmographyForPerson(
    name
) {

    if (
        !filmographyModal ||
        !filmographyPerson
    ) {

        return;

    }


    filmographyPerson.value =
        name;


    filmographyModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";


    findFilmography();

}


/* =========================================================
   CLOSE FILMOGRAPHY
   ========================================================= */

function closeFilmography() {

    if (
        !filmographyModal
    ) {

        return;

    }


    filmographyModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}
/* =========================================================
   COMMON FILMS OPEN
   ========================================================= */

if (
    findPeopleButton &&
    commonFilmsModal
) {

    findPeopleButton.addEventListener(
        "click",
        () => {

            commonFilmsModal.classList.add(
                "active"
            );


            if (
                personOne
            ) {

                personOne.value =
                    "";

            }


            if (
                personTwo
            ) {

                personTwo.value =
                    "";

            }


            if (
                personOneSuggestions
            ) {

                personOneSuggestions.innerHTML =
                    "";

                personOneSuggestions.classList.remove(
                    "active"
                );

            }


            if (
                personTwoSuggestions
            ) {

                personTwoSuggestions.innerHTML =
                    "";

                personTwoSuggestions.classList.remove(
                    "active"
                );

            }


            if (
                commonFilmsResults
            ) {

                commonFilmsResults.innerHTML =
                    "";

            }


            if (
                personOne
            ) {

                personOne.focus();

            }

        }
    );

}


/* =========================================================
   COMMON FILMS CLOSE
   ========================================================= */

if (
    commonFilmsClose
) {

    commonFilmsClose.addEventListener(
        "click",
        closeCommonFilms
    );

}


/* =========================================================
   COMMON FILMS BACKDROP
   ========================================================= */

if (
    commonFilmsModal
) {

    commonFilmsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                commonFilmsModal
            ) {

                closeCommonFilms();

            }

        }
    );

}


/* =========================================================
   CLOSE COMMON FILMS
   ========================================================= */

function closeCommonFilms() {

    if (
        !commonFilmsModal
    ) {

        return;

    }


    commonFilmsModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   COMMON FILMS INPUT 1
   ========================================================= */

if (
    personOne &&
    personOneSuggestions
) {

    personOne.addEventListener(
        "input",
        () => {

            showPersonSuggestions(
                personOne,
                personOneSuggestions
            );

        }
    );

}


/* =========================================================
   COMMON FILMS INPUT 2
   ========================================================= */

if (
    personTwo &&
    personTwoSuggestions
) {

    personTwo.addEventListener(
        "input",
        () => {

            showPersonSuggestions(
                personTwo,
                personTwoSuggestions
            );

        }
    );

}


/* =========================================================
   COMMON FILMS BUTTON
   ========================================================= */

if (
    findCommonFilmsButton
) {

    findCommonFilmsButton.addEventListener(
        "click",
        findCommonFilms
    );

}


/* =========================================================
   COMMON FILMS ENTER
   ========================================================= */

if (
    personOne
) {

    personOne.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                findCommonFilms();

            }

        }
    );

}


if (
    personTwo
) {

    personTwo.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                findCommonFilms();

            }

        }
    );

}


/* =========================================================
   FILMOGRAPHY OPEN
   ========================================================= */

if (
    filmographyButton &&
    filmographyModal
) {

    filmographyButton.addEventListener(
        "click",
        () => {

            filmographyModal.classList.add(
                "active"
            );


            if (
                filmographyPerson
            ) {

                filmographyPerson.value =
                    "";

            }


            if (
                filmographySuggestions
            ) {

                filmographySuggestions.innerHTML =
                    "";

                filmographySuggestions.classList.remove(
                    "active"
                );

            }


            if (
                filmographyResults
            ) {

                filmographyResults.innerHTML =
                    "";

            }


            if (
                filmographyPerson
            ) {

                filmographyPerson.focus();

            }

        }
    );

}


/* =========================================================
   FILMOGRAPHY CLOSE
   ========================================================= */

if (
    filmographyClose
) {

    filmographyClose.addEventListener(
        "click",
        closeFilmography
    );

}


/* =========================================================
   FILMOGRAPHY BACKDROP
   ========================================================= */

if (
    filmographyModal
) {

    filmographyModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                filmographyModal
            ) {

                closeFilmography();

            }

        }
    );

}


/* =========================================================
   FILMOGRAPHY INPUT
   ========================================================= */

if (
    filmographyPerson &&
    filmographySuggestions
) {

    filmographyPerson.addEventListener(
        "input",
        showFilmographySuggestions
    );

}


/* =========================================================
   FILMOGRAPHY BUTTON
   ========================================================= */

if (
    findFilmographyButton
) {

    findFilmographyButton.addEventListener(
        "click",
        findFilmography
    );

}


/* =========================================================
   FILMOGRAPHY ENTER
   ========================================================= */

if (
    filmographyPerson
) {

    filmographyPerson.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                findFilmography();

            }

        }
    );

}


/* =========================================================
   FILM DETAILS CLOSE
   ========================================================= */

if (
    filmDetailsClose
) {

    filmDetailsClose.addEventListener(
        "click",
        closeFilmDetails
    );

}


/* =========================================================
   FILM DETAILS BACKDROP
   ========================================================= */

if (
    filmDetailsModal
) {

    filmDetailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                filmDetailsModal
            ) {

                closeFilmDetails();

            }

        }
    );

}


/* =========================================================
   GLOBAL ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            filmDetailsModal &&
            filmDetailsModal.classList.contains(
                "active"
            )
        ) {

            closeFilmDetails();

            return;

        }


        if (
            commonFilmsModal &&
            commonFilmsModal.classList.contains(
                "active"
            )
        ) {

            closeCommonFilms();

            return;

        }


        if (
            filmographyModal &&
            filmographyModal.classList.contains(
                "active"
            )
        ) {

            closeFilmography();

            return;

        }

    }
);


/* =========================================================
   CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            personOne &&
            personOneSuggestions &&
            !personOne.contains(
                event.target
            ) &&
            !personOneSuggestions.contains(
                event.target
            )
        ) {

            personOneSuggestions.classList.remove(
                "active"
            );

        }


        if (
            personTwo &&
            personTwoSuggestions &&
            !personTwo.contains(
                event.target
            ) &&
            !personTwoSuggestions.contains(
                event.target
            )
        ) {

            personTwoSuggestions.classList.remove(
                "active"
            );

        }


        if (
            filmographyPerson &&
            filmographySuggestions &&
            !filmographyPerson.contains(
                event.target
            ) &&
            !filmographySuggestions.contains(
                event.target
            )
        ) {

            filmographySuggestions.classList.remove(
                "active"
            );

        }

    }
);
/* =========================================================
   CREATE FILM DETAILS HEADER
   ========================================================= */

function createFilmDetailsHeader(
    film
) {

    const poster =
        escapeHTML(
            film.poster || ""
        );


    const title =
        escapeHTML(
            film.title ||
            "Untitled"
        );


    const year =
        escapeHTML(
            film.year ||
            ""
        );


    const directors =
        getDirectorNames(
            film.director
        );


    const cast =
        getCastNames(
            film.cast
        );


    return `

        <div
            class="film-details-poster"
        >

            <img
                src="${poster}"
                alt="${title}"
            >

        </div>


        <div
            class="film-details-info"
        >

            <div
                class="film-details-year"
            >
                ${year}
            </div>


            <h2
                class="film-details-title"
            >
                ${title}
            </h2>


            ${film.now_showing ===
            true
            ? `

                        <div
                            class="film-details-now-showing"
                        >
                            NOW SHOWING
                        </div>

                    `
            : ""
        }


            ${directors.length
            ? `

                        <div
                            class="film-details-header-director"
                        >

                            <span>
                                DIRECTOR
                            </span>

                            <div>
                                ${directors
                .map(
                    director =>
                        `
                                                <span
                                                    class="film-details-person-tag"
                                                >
                                                    ${escapeHTML(
                            director
                        )}
                                                </span>
                                            `
                )
                .join("")}
                            </div>

                        </div>

                    `
            : ""
        }


            ${cast.length
            ? `

                        <div
                            class="film-details-header-cast"
                        >

                            <span>
                                CAST
                            </span>

                            <div>
                                ${cast
                .map(
                    person =>
                        `
                                                <span
                                                    class="film-details-person-tag"
                                                >
                                                    ${escapeHTML(
                            person
                        )}
                                                </span>
                                            `
                )
                .join("")}
                            </div>

                        </div>

                    `
            : ""
        }

        </div>

    `;

}


/* =========================================================
   CREATE FILM DETAILS PEOPLE
   ========================================================= */

function createFilmDetailsPeople(
    film
) {

    const directors =
        getDirectorNames(
            film.director
        );


    const cast =
        getCastNames(
            film.cast
        );


    return `

        <div
            class="film-details-people-grid"
        >

            <div
                class="film-details-people-block"
            >

                <div
                    class="film-details-label"
                >
                    DIRECTOR
                </div>


                <div
                    class="film-details-large-value"
                >

                    ${directors.length
            ? directors
                .map(
                    director =>
                        `
                                            <span
                                                class="film-details-person-tag"
                                            >
                                                ${escapeHTML(
                            director
                        )}
                                            </span>
                                        `
                )
                .join("")
            : `
                                <span
                                    class="film-details-empty-value"
                                >
                                    NOT AVAILABLE
                                </span>
                            `
        }

                </div>

            </div>


            <div
                class="film-details-people-block"
            >

                <div
                    class="film-details-label"
                >
                    CAST
                </div>


                <div
                    class="film-details-large-value"
                >

                    ${cast.length
            ? cast
                .map(
                    person =>
                        `
                                            <span
                                                class="film-details-person-tag"
                                            >
                                                ${escapeHTML(
                            person
                        )}
                                            </span>
                                        `
                )
                .join("")
            : `
                                <span
                                    class="film-details-empty-value"
                                >
                                    NOT AVAILABLE
                                </span>
                            `
        }

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   CREATE FILM DETAILS PRODUCTION
   ========================================================= */

function createFilmDetailsProduction(
    film
) {

    const credits = [

        [
            "PRODUCERS",
            film.producers
        ],

        [
            "SCREENPLAY",
            film.screenplay
        ],

        [
            "PRODUCTION DESIGNER",
            film.production_designer
        ],

        [
            "CINEMATOGRAPHER",
            film.cinematographer
        ],

        [
            "EDITOR",
            film.editor
        ],

        [
            "SOUND",
            film.sound
        ],

        [
            "MUSIC",
            film.music
        ]

    ];


    return `

        <div
            class="film-details-label"
        >
            PRODUCTION CREDITS
        </div>


        <div
            class="film-details-production-grid"
        >

            ${credits
            .map(
                (
                    [
                        label,
                        value
                    ]
                ) => {

                    const names =
                        getPeopleNames(
                            value
                        );


                    return `

                                <div
                                    class="film-details-credit"
                                >

                                    <div
                                        class="film-details-credit-label"
                                    >
                                        ${label}
                                    </div>


                                    <div
                                        class="film-details-credit-value"
                                    >

                                        ${names.length
                            ? names
                                .map(
                                    name =>
                                        `
                                                                <span
                                                                    class="film-details-credit-person"
                                                                >
                                                                    ${escapeHTML(
                                            name
                                        )}
                                                                </span>
                                                            `
                                )
                                .join("")
                            : `
                                                    <span
                                                        class="film-details-empty-value"
                                                    >
                                                        —
                                                    </span>
                                                `
                        }

                                    </div>

                                </div>

                            `;

                }
            )
            .join("")
        }

        </div>

    `;

}


/* =========================================================
   CREATE FILM DETAILS WATCH
   ========================================================= */

function createFilmDetailsWatch(
    film
) {

    const sources =
        Array.isArray(
            film.watch
        )
            ? film.watch
            : [];


    const sourceHTML =
        sources
            .map(
                source => {

                    if (
                        !source
                    ) {

                        return "";

                    }


                    const type =
                        typeof source ===
                            "string"
                            ? source
                            : source.type;


                    if (
                        !type
                    ) {

                        return "";

                    }


                    const normalized =
                        String(
                            type
                        )
                            .toLowerCase()
                            .trim();


                    const label =
                        platformNames[
                        normalized
                        ] ||
                        normalized
                            .replace(
                                /_/g,
                                " "
                            )
                            .toUpperCase();


                    if (
                        typeof source ===
                        "object" &&
                        source.url
                    ) {

                        return `

                            <a
                                class="film-details-watch-platform ${normalized}"
                                href="${escapeHTML(
                            source.url
                        )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHTML(
                            label
                        )}
                            </a>

                        `;

                    }


                    return `

                        <span
                            class="film-details-watch-platform ${normalized}"
                        >
                            ${escapeHTML(
                        label
                    )}
                        </span>

                    `;

                }
            )
            .join("");


    const nowShowing =
        film.now_showing ===
            true
            ? `

                <span
                    class="film-details-watch-platform now-showing"
                >
                    NOW SHOWING
                </span>

            `
            : "";


    return `

        <div
            class="film-details-label"
        >
            WHERE TO WATCH
        </div>


        <div
            class="film-details-watch-list"
        >

            ${nowShowing
        }


            ${sourceHTML ||
        `
                    <span
                        class="film-details-watch-platform none"
                    >
                        NO KNOWN SOURCE
                    </span>
                `
        }

        </div>

    `;

}


/* =========================================================
   CREATE FILM DETAILS AWARDS
   ========================================================= */

function createFilmDetailsAwards(
    film
) {

    const awards =
        Array.isArray(
            film.awards
        )
            ? film.awards
            : [];


    const winningAwards = [];


    awards.forEach(
        award => {

            if (
                !award ||
                typeof award !==
                "object"
            ) {

                return;

            }


            Object.keys(
                award
            ).forEach(
                key => {

                    /*
                     * "name" is the recipient
                     * for acting awards.
                     */

                    if (
                        key ===
                        "name"
                    ) {

                        return;

                    }


                    if (
                        award[key] !==
                        true
                    ) {

                        return;

                    }


                    /*
                     * Support both the
                     * current JSON key:
                     *
                     * special_jury
                     *
                     * and your older:
                     *
                     * jury
                     */

                    let awardKey =
                        key;


                    if (
                        key ===
                        "jury"
                    ) {

                        awardKey =
                            "special_jury";

                    }


                    if (
                        !awardNames[
                        awardKey
                        ]
                    ) {

                        return;

                    }


                    winningAwards.push({

                        key:
                            awardKey,

                        name:
                            award.name ||
                            ""

                    });

                }
            );

        }
    );


    if (
        !winningAwards.length
    ) {

        return `

            <div
                class="film-details-label"
            >
                AWARDS WON
            </div>


            <div
                class="film-awards-empty"
            >
                NO AWARDS RECORDED
            </div>

        `;

    }


    return `

        <div
            class="film-details-label"
        >
            AWARDS WON
        </div>


        <div
            class="film-details-awards"
        >

            ${winningAwards
            .map(
                award => {

                    const title =
                        awardNames[
                        award.key
                        ];


                    return `

                                <div
                                    class="film-award"
                                >

                                    <div
                                        class="film-award-icon"
                                    >
                                        ★
                                    </div>


                                    <div
                                        class="film-award-content"
                                    >

                                        <div
                                            class="film-award-name"
                                        >
                                            ${escapeHTML(
                        title
                    )}
                                            (${escapeHTML(
                        film.year ||
                        ""
                    )})
                                        </div>


                                        ${award.name
                            ? `

                                                    <div
                                                        class="film-award-recipient"
                                                    >
                                                        ${escapeHTML(
                                award.name
                            )}
                                                    </div>

                                                `
                            : ""
                        }

                                    </div>

                                </div>

                            `;

                }
            )
            .join("")
        }

        </div>

    `;

}
/* =========================================================
   OPEN FILM DETAILS
   ========================================================= */

function openFilmDetails(
    film
) {

    if (
        !filmDetailsModal
    ) {

        return;

    }


    /*
     * HEADER
     *
     * Important:
     * Only populate the dedicated header
     * container. Do NOT replace the entire
     * modal, otherwise synopsis/director/
     * cast sections disappear.
     */

    if (
        filmDetailsHeader
    ) {

        filmDetailsHeader.innerHTML =
            createFilmDetailsHeader(
                film
            );

    }


    /*
     * SYNOPSIS
     */

    if (
        filmDetailsSynopsis
    ) {

        filmDetailsSynopsis.innerHTML = `

            <div
                class="film-details-label"
            >
                SYNOPSIS
            </div>


            <div
                class="film-details-full-description"
            >
                ${escapeHTML(
            film.description ||
            "No synopsis available."
        )}
            </div>

        `;

    }


    /*
     * DIRECTOR + CAST
     */

    if (
        filmDetailsPeople
    ) {

        filmDetailsPeople.innerHTML =
            createFilmDetailsPeople(
                film
            );

    }


    /*
     * PRODUCTION CREDITS
     */

    if (
        filmDetailsProduction
    ) {

        filmDetailsProduction.innerHTML =
            createFilmDetailsProduction(
                film
            );

    }


    /*
     * WHERE TO WATCH
     */

    if (
        filmDetailsWatch
    ) {

        filmDetailsWatch.innerHTML =
            createFilmDetailsWatch(
                film
            );

    }


    /*
     * AWARDS
     */

    if (
        filmDetailsAwards
    ) {

        filmDetailsAwards.innerHTML =
            createFilmDetailsAwards(
                film
            );

    }


    /*
     * Poster fallback
     */

    if (
        filmDetailsHeader
    ) {

        const poster =
            filmDetailsHeader.querySelector(
                ".film-details-poster img"
            );


        if (
            poster
        ) {

            poster.addEventListener(
                "error",
                function () {

                    this.style.display =
                        "none";


                    const parent =
                        this.parentElement;


                    if (
                        parent &&
                        !parent.querySelector(
                            ".poster-missing"
                        )
                    ) {

                        const missing =
                            document.createElement(
                                "div"
                            );


                        missing.className =
                            "poster-missing";


                        missing.textContent =
                            "POSTER NOT AVAILABLE";


                        parent.appendChild(
                            missing
                        );

                    }

                },
                {
                    once:
                        true
                }
            );

        }

    }


    /*
     * OPEN
     */

    filmDetailsModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE FILM DETAILS
   ========================================================= */

function closeFilmDetails() {

    if (
        !filmDetailsModal
    ) {

        return;

    }


    filmDetailsModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   FILM DETAILS KEYBOARD
   ========================================================= */

if (
    filmDetailsModal
) {

    filmDetailsModal.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeFilmDetails();

            }

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        () => {

            currentPage =
                1;


            renderFilms();

        }
    );

}


/* =========================================================
   YEAR FILTER
   ========================================================= */

if (
    yearFilter
) {

    yearFilter.addEventListener(
        "change",
        () => {

            currentPage =
                1;


            renderFilms();

        }
    );

}


/* =========================================================
   WATCH FILTER
   ========================================================= */

if (
    watchFilter
) {

    watchFilter.addEventListener(
        "change",
        () => {

            currentPage =
                1;


            renderFilms();

        }
    );

}


/* =========================================================
   HOME BUTTON
   ========================================================= */

if (
    homeButton
) {

    homeButton.addEventListener(
        "click",
        () => {

            showHome();

        }
    );

}


/* =========================================================
   CAST BUTTON
   ========================================================= */

if (
    castButton
) {

    castButton.addEventListener(
        "click",
        () => {

            showCast();

        }
    );

}


/* =========================================================
   DIRECTORS BUTTON
   ========================================================= */

if (
    directorsButton
) {

    directorsButton.addEventListener(
        "click",
        () => {

            showDirectors();

        }
    );

}


/* =========================================================
   SHOW HOME
   ========================================================= */

function showHome() {

    if (
        filmsSection
    ) {

        filmsSection.style.display =
            "";

    }


    if (
        filmControls
    ) {

        filmControls.style.display =
            "";

    }


    if (
        castSection
    ) {

        castSection.style.display =
            "none";

    }


    if (
        directorsSection
    ) {

        directorsSection.style.display =
            "none";

    }


    setActiveNavigation(
        homeButton
    );


    currentPage =
        1;


    renderFilms();


    window.scrollTo({
        top: 0,
        behavior:
            "smooth"
    });

}


/* =========================================================
   SHOW CAST
   ========================================================= */

function showCast() {

    if (
        filmsSection
    ) {

        filmsSection.style.display =
            "none";

    }


    if (
        filmControls
    ) {

        filmControls.style.display =
            "none";

    }


    if (
        castSection
    ) {

        castSection.style.display =
            "";

    }


    if (
        directorsSection
    ) {

        directorsSection.style.display =
            "none";

    }


    setActiveNavigation(
        castButton
    );


    window.scrollTo({
        top: 0,
        behavior:
            "smooth"
    });

}


/* =========================================================
   SHOW DIRECTORS
   ========================================================= */

function showDirectors() {

    if (
        filmsSection
    ) {

        filmsSection.style.display =
            "none";

    }


    if (
        filmControls
    ) {

        filmControls.style.display =
            "none";

    }


    if (
        castSection
    ) {

        castSection.style.display =
            "none";

    }


    if (
        directorsSection
    ) {

        directorsSection.style.display =
            "";

    }


    setActiveNavigation(
        directorsButton
    );


    window.scrollTo({
        top: 0,
        behavior:
            "smooth"
    });

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function setActiveNavigation(
    activeButton
) {

    const buttons = [

        homeButton,

        castButton,

        directorsButton,

        findPeopleButton,

        filmographyButton

    ];


    buttons.forEach(
        button => {

            if (
                !button
            ) {

                return;

            }


            button.classList.remove(
                "active"
            );

        }
    );


    if (
        activeButton
    ) {

        activeButton.classList.add(
            "active"
        );

    }

}
/* =========================================================
   FILMOGRAPHY SUGGESTIONS
   ========================================================= */

function showFilmographySuggestions() {

    if (
        !filmographyPerson ||
        !filmographySuggestions
    ) {

        return;

    }


    const query =
        filmographyPerson.value
            .trim()
            .toLowerCase();


    /*
     * Do not preload the entire list.
     * Suggestions only appear once the
     * user has typed at least 2 characters.
     */

    if (
        query.length <
        2
    ) {

        filmographySuggestions.innerHTML =
            "";

        filmographySuggestions.classList.remove(
            "active"
        );

        return;

    }


    const matches =
        getCastSuggestions(
            query
        );


    filmographySuggestions.innerHTML =
        "";


    if (
        !matches.length
    ) {

        filmographySuggestions.classList.remove(
            "active"
        );

        return;

    }


    matches.forEach(
        name => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "person-suggestion";


            button.textContent =
                name;


            button.addEventListener(
                "mousedown",
                event => {

                    event.preventDefault();

                }
            );


            button.addEventListener(
                "click",
                () => {

                    filmographyPerson.value =
                        name;


                    filmographySuggestions.classList.remove(
                        "active"
                    );


                    findFilmography();

                }
            );


            filmographySuggestions.appendChild(
                button
            );

        }
    );


    filmographySuggestions.classList.add(
        "active"
    );

}


/* =========================================================
   COMMON FILMS SUGGESTIONS
   ========================================================= */

function showPersonSuggestions(
    input,
    container
) {

    if (
        !input ||
        !container
    ) {

        return;

    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    /*
     * Do not preload names.
     * Start searching only after
     * two characters are entered.
     */

    if (
        query.length <
        2
    ) {

        container.innerHTML =
            "";

        container.classList.remove(
            "active"
        );

        return;

    }


    const matches =
        getCastSuggestions(
            query
        );


    container.innerHTML =
        "";


    if (
        !matches.length
    ) {

        container.classList.remove(
            "active"
        );

        return;

    }


    matches.forEach(
        name => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "person-suggestion";


            button.textContent =
                name;


            button.addEventListener(
                "mousedown",
                event => {

                    event.preventDefault();

                }
            );


            button.addEventListener(
                "click",
                () => {

                    input.value =
                        name;


                    container.classList.remove(
                        "active"
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    container.classList.add(
        "active"
    );

}


/* =========================================================
   NAVIGATION KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * HOME
         */

        if (
            event.key ===
            "Home" &&
            !isTypingInInput(
                event.target
            )
        ) {

            showHome();

        }

    }
);


/* =========================================================
   CHECK INPUT
   ========================================================= */

function isTypingInInput(
    element
) {

    if (
        !element
    ) {

        return false;

    }


    const tag =
        element.tagName
            ? element.tagName.toLowerCase()
            : "";


    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        element.isContentEditable
    );

}


/* =========================================================
   DEVELOPER MODAL
   ========================================================= */

if (
    developerClose
) {

    developerClose.addEventListener(
        "click",
        () => {

            if (
                developerModal
            ) {

                developerModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


if (
    developerModal
) {

    developerModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                developerModal
            ) {

                developerModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "cinemalaya-theme"
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );


        if (
            themeToggle
        ) {

            themeToggle.checked =
                true;

        }


        if (
            themeLabel
        ) {

            themeLabel.textContent =
                "DARK";

        }

    } else {

        document.body.classList.remove(
            "dark-mode"
        );


        if (
            themeToggle
        ) {

            themeToggle.checked =
                false;

        }


        if (
            themeLabel
        ) {

            themeLabel.textContent =
                "LIGHT";

        }

    }

}


/* =========================================================
   CHANGE THEME
   ========================================================= */

if (
    themeToggle
) {

    themeToggle.addEventListener(
        "change",
        () => {

            const isDark =
                themeToggle.checked;


            document.body.classList.toggle(
                "dark-mode",
                isDark
            );


            localStorage.setItem(
                "cinemalaya-theme",
                isDark
                    ? "dark"
                    : "light"
            );


            if (
                themeLabel
            ) {

                themeLabel.textContent =
                    isDark
                        ? "DARK"
                        : "LIGHT";

            }

        }
    );

}


/* =========================================================
   CURSOR
   ========================================================= */

function updateCursor() {

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    /*
     * CSS handles the actual cursor.
     * This class lets the stylesheet
     * switch between cursor-1.png and
     * cursor-2.png.
     */

    document.body.classList.toggle(
        "cursor-dark",
        isDark
    );

}


/* =========================================================
   WATCH FOR THEME CHANGES
   ========================================================= */

const themeObserver =
    new MutationObserver(
        () => {

            updateCursor();

        }
    );


themeObserver.observe(
    document.body,
    {
        attributes:
            true,
        attributeFilter:
            [
                "class"
            ]
    }
);


/* =========================================================
   INITIAL CURSOR
   ========================================================= */

updateCursor();


/* =========================================================
   INITIAL PAGE STATE
   ========================================================= */

if (
    castSection
) {

    castSection.style.display =
        "none";

}


if (
    directorsSection
) {

    directorsSection.style.display =
        "none";

}


/* =========================================================
   START
   ========================================================= */

loadTheme();

loadFilms();

/* =========================================================
   GLOBAL ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        if (
            filmDetailsModal &&
            filmDetailsModal.classList.contains(
                "active"
            )
        ) {

            closeFilmDetails();

            return;

        }


        if (
            commonFilmsModal &&
            commonFilmsModal.classList.contains(
                "active"
            )
        ) {

            closeCommonFilms();

            return;

        }


        if (
            filmographyModal &&
            filmographyModal.classList.contains(
                "active"
            )
        ) {

            closeFilmography();

            return;

        }

    }
);


/* =========================================================
   CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            personOne &&
            personOneSuggestions &&
            !personOne.contains(
                event.target
            ) &&
            !personOneSuggestions.contains(
                event.target
            )
        ) {

            personOneSuggestions.classList.remove(
                "active"
            );

        }


        if (
            personTwo &&
            personTwoSuggestions &&
            !personTwo.contains(
                event.target
            ) &&
            !personTwoSuggestions.contains(
                event.target
            )
        ) {

            personTwoSuggestions.classList.remove(
                "active"
            );

        }


        if (
            filmographyPerson &&
            filmographySuggestions &&
            !filmographyPerson.contains(
                event.target
            ) &&
            !filmographySuggestions.contains(
                event.target
            )
        ) {

            filmographySuggestions.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   THEME TOGGLE
   ========================================================= */

if (
    themeToggle
) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isDark =
                document.documentElement
                    .classList.contains(
                        "dark-mode"
                    );


            setTheme(
                !isDark
            );

        }
    );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

loadTheme();

loadFilms();