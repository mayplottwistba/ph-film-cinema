const platformNames = {
    netflix:    "Netflix",
    juanflix:   "Juanflix",
    ccp:        "CCP",
    youtube:    "YouTube",
    prime:      "Prime Video",
    appletv:    "Apple TV",
    iwant:      "iWant",
    viva:       "VivaOne",
    external:   "External",
    none:       "No known source"
};

// list of all available streaming platforms to date

const filmsGrid     = document.getElementById("filmsGrid");
const pagination    = document.getElementById("pagination");
const yearFilter    = document.getElementById("yearFilter");
const watchFilter   = document.getElementById("watchFilter");
const searchInput   = document.getElementById("searchInput");

// navigation bar
const homeButton = document.getElementById("homeButton");
const castButton = document.getElementById("castButton");
const directorsButton = document.getElementById("directorsButton");

// cast display
const castSection = document.getElementById("castSection");
const castRanking = document.getElementById("castRanking");

// directors display
const directorsSection = document.getElementById("directorsSection");
const directorsRanking = document.getElementById("directorsRanking");

// pop-ups for selection criteria
const developerModal        = document.getElementById("developerModal");
const developerClose        = document.getElementById("developerClose");
const findPeopleButton      = document.getElementById("findPeopleButton");
const commonFilmsModal      = document.getElementById("commonFilmsModal");
const commonFilmsClose      = document.getElementById("commonFilmsClose");
const findCommonFilmsButton = document.getElementById("findCommonFilms");
const filmographyButton     = document.getElementById("filmographyButton");
const filmographyModal      = document.getElementById("filmographyModal");
const filmographyClose      = document.getElementById("filmographyClose");
const filmographyPerson     = document.getElementById("filmographyPerson");

// filmography title
const filmographyLabel = document.getElementById("filmographyLabel");
const filmographyTitle = document.getElementById("filmographyTitle");

// Cast selection
const personOne             = document.getElementById("personOne");
const personTwo             = document.getElementById("personTwo");

// dropdown cast
const personOneSuggestions  = document.getElementById("personOneSuggestions");
const personTwoSuggestions  = document.getElementById("personTwoSuggestions");
const filmographySuggestions = document.getElementById("filmographySuggestions");

// scroll view of results
const commonFilmsResults    = document.getElementById("commonFilmsResults");
const filmographyResults = document.getElementById("filmographyResults");

// search
const findFilmographyButton = document.getElementById("findFilmography");


let films = [];
let currentPage = 1;

// maximum display per page
// pagination update to cast list to max 15
const filmsPerPage = 15;


// loads films
async function loadFilms() {
    try {
        const response = await fetch(
            "./films.json",
            {
                cache: "no-store"
            }
        );

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

        // filter by year / sort order
        films = data;

        films.sort((a, b) => {
            if (a.year !== b.year) {
                return b.year - a.year;
            }

            return String(a.title || "")
                .localeCompare(
                    String(b.title || ""),
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
        });

        // show details per film
        populateYears();
        populateWatchFilters();
        buildCastRanking();
        buildDirectorsRanking();

        currentPage = 1;
        renderFilms();

    } catch (error) {
        console.error(
            "Error on JSON array:",
            error
        );

        if (filmsGrid) {
            filmsGrid.innerHTML = `
                <div class="empty-films">
                    UNABLE TO LOAD FILMS
                    <br><br>
                    <small>
                        ${escapeHTML(error.message)}
                    </small>
                </div>
            `;
        }

        if (pagination) {
            pagination.innerHTML = "";
        }
    }
}


// by year display

function populateYears() {
    if (!yearFilter) {
        return;
    }

    // loop display films per year
    for (
        // console.log (year);
        let year = 2026;
        year >= 2005;
        year--
    ) {
        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}


// stream filter
function populateWatchFilters() {
    if (!watchFilter) {
        return;
    }

    const platforms = [
        ["netflix", "Netflix"],
        ["juanflix", "Juanflix"],
        ["ccp", "CCP"],
        ["youtube", "YouTube"],
        ["prime", "Prime Video"],
        ["appletv", "Apple TV"],
        ["iwant", "iWant"],
        ["viva", "VivaOne"],
        ["external", "External"],
        ["none", "No known source"],
        ["now_showing", "Now Showing"]
    ];

    platforms.forEach(
        ([value, label]) => {
            const option =
                document.createElement("option");

            option.value = value;
            option.textContent = label;
            watchFilter.appendChild(option);
        }
    );
}


// filter films based on filters
function getFilteredFilms() {
    // year
    const selectedYear =
        yearFilter
            ? yearFilter.value
            : "all";

    // stram
    const selectedWatch =
        watchFilter
            ? watchFilter.value
            : "all";

     // title
    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    // display
    return films
        .filter(film => {
            if (selectedYear === "all") {
                return true;
            }

            return String(film.year) ===
                String(selectedYear);
        })

        .filter(film => {
            if (selectedWatch === "all") {
                return true;
            }

            if (
                selectedWatch ===
                "now_showing"
            ) {
                return film.now_showing === true;
            }

            if (!Array.isArray(film.watch)) {
                return false;
            }

            return film.watch.some(
                source =>
                    source &&
                    source.type ===
                    selectedWatch
            );
        })

        .filter(film => {
            if (!searchTerm) {
                return true;
            }

            return String(film.title || "")
                .toLowerCase()
                .includes(searchTerm);
        })

        .sort((a, b) => {
            if (selectedYear !== "all") {
                return String(a.title || "")
                    .localeCompare(
                        String(b.title || ""),
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    );
            }

            if (a.year !== b.year) {
                return b.year - a.year;
            }

            return String(a.title || "")
                .localeCompare(
                    String(b.title || ""),
                    undefined,
                    {
                        sensitivity: "base"
                    }
                );
        });
}


// exit
function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// to uppercase
function formatName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


// format cast names to auto detect comma or &
function getCastNames(cast) {
    if (!cast) {
        return [];
    }

    if (Array.isArray(cast)) {
        return cast
            .flatMap(name =>
                String(name).split(/,|&/)
            )
            .map(name =>
                name.trim()
            )
            .filter(Boolean);
    }

    return String(cast)
        .split(/,|&/)
        .map(name =>
            name.trim()
        )
        .filter(Boolean);
}


// format director names to auto detect comma or &
function getDirectorNames(director) {
    if (!director) {
        return [];
    }

    if (Array.isArray(director)) {
        return director
            .flatMap(name =>
                String(name).split(/,|&/)
            )
            .map(name =>
                name.trim()
            )
            .filter(Boolean);
    }

    return String(director)
        .split(/,|&/)
        .map(name =>
            name.trim()
        )
        .filter(Boolean);
}


// make cast names as tags
function createCastTags(cast) {
    const names =
        getCastNames(cast);

    if (names.length === 0) {
        return `
            <span class="cast-unavailable">
                Cast information unavailable
            </span>
        `;
    }

    return names
        .map(name => `
            <span class="cast-tag">
                ${escapeHTML(name)}
            </span>
        `)
        .join("");
}


// director name tags
function createDirectorTag(director) {
    const names =
        getDirectorNames(director);

    if (names.length === 0) {
        return `
            <span class="director-unavailable">
                Director information unavailable
            </span>
        `;
    }

    return names
        .map(name => `
            <span class="director-tag">
                ${escapeHTML(name)}
            </span>
        `)
        .join("");
}


// streaming platform tags
function createWatchOptions(
    sources,
    nowShowing
) {
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
            if (
                !source ||
                !source.type
            ) {
                return "";
            }

            const type =
                source.type;

            const name =
                platformNames[type] ||
                "No known source";

            const clickableTypes = [
                "external",
                "youtube",
                "prime",
                "appletv",
                "iwant",
                "viva"
            ];

            if (
                clickableTypes.includes(type) &&
                source.url
            ) {
                return `
                    <a
                        class="platform ${escapeHTML(type)}"
                        href="${escapeHTML(source.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${escapeHTML(name)}
                    </a>
                `;
            }

            return `
                <span
                    class="platform ${escapeHTML(type)}"
                >
                    ${escapeHTML(name)}
                </span>
            `;
        })
        .join("");

    return html;
}


// card film copy the one from cinemalaya scheduler
function createFilmCard(film) {
    const card =
        document.createElement("article");

    card.className =
        "film-card";

    const watchOptions =
        createWatchOptions(
            film.watch || [],
            film.now_showing
        );

    const castTags =
        createCastTags(film.cast);

    const directorTags =
        createDirectorTag(
            film.director
        );

    card.innerHTML = `
        <div class="poster-wrap">
            <img
                src="${escapeHTML(
                    film.poster || ""
                )}"
                alt="${escapeHTML(
                    film.title || ""
                )}"
            >
        </div>

        <div class="film-info">

            <div class="film-year">
                ${escapeHTML(
                    film.year || ""
                )}
            </div>

            <div class="film-title">
                ${escapeHTML(
                    film.title || ""
                )}
            </div>

            <div class="film-description">
                ${escapeHTML(
                    film.description || ""
                )}
            </div>

            <button
                class="see-more"
                type="button"
                data-target="description"
            >
                SEE MORE
            </button>

            <div class="film-director-label">
                DIRECTOR
            </div>

            <div class="film-director">
                ${directorTags}
            </div>

            <div class="film-cast-label">
                CAST
            </div>

            <div class="film-cast">
                ${castTags}
            </div>

            <button
                class="see-more"
                type="button"
                data-target="cast"
            >
                SEE MORE
            </button>

            <div class="watch-label">
                WHERE TO WATCH:
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

    if (image) {
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
    }

    setupSeeMore(card);
    return card;
}


// limit text length add see more / less button
// limit to 2 lines people. 3 description
function setupSeeMore(card) {
    const buttons =
        card.querySelectorAll(
            ".see-more"
        );

    buttons.forEach(button => {
        const targetType =
            button.dataset.target;

        let target;

        if (
            targetType ===
            "description"
        ) {
            target =
                card.querySelector(
                    ".film-description"
                );
        }

        if (
            targetType ===
            "cast"
        ) {
            target =
                card.querySelector(
                    ".film-cast"
                );
        }

        if (!target) {
            button.remove();
            return;
        }

        requestAnimationFrame(() => {
            if (
                target.scrollHeight <=
                target.clientHeight + 1
            ) {
                button.remove();
            }
        });

        button.addEventListener(
            "click",
            () => {
                const expanded =
                    target.classList.contains(
                        "expanded"
                    );

                if (expanded) {
                    target.classList.remove(
                        "expanded"
                    );

                    button.textContent =
                        "SEE MORE";
                } else {
                    target.classList.add(
                        "expanded"
                    );

                    button.textContent =
                        "SEE LESS";
                }
            }
        );
    });
}


/* RENDER FILMS */

function renderFilms() {
    if (!filmsGrid) {
        return;
    }

    filmsGrid.innerHTML = "";

    const filteredFilms =
        getFilteredFilms();

    const totalFilms =
        filteredFilms.length;

    const totalPages =
        Math.ceil(
            totalFilms /
            filmsPerPage
        );

    if (totalFilms === 0) {
        filmsGrid.innerHTML = `
            <div class="empty-films">
                NO FILMS FOUND
            </div>
        `;

        if (pagination) {
            pagination.innerHTML = "";
        }

        return;
    }

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex =
        (currentPage - 1) *
        filmsPerPage;

    const endIndex =
        startIndex +
        filmsPerPage;

    const pageFilms =
        filteredFilms.slice(
            startIndex,
            endIndex
        );

    pageFilms.forEach(film => {
        filmsGrid.appendChild(
            createFilmCard(film)
        );
    });

    renderPagination(totalPages);
}


// pagination
function renderPagination(totalPages) {
    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const previous =
        document.createElement("button");

    previous.type = "button";
    previous.textContent = "‹";
    previous.disabled =
        currentPage === 1;

    previous.addEventListener(
        "click",
        () => {
            if (currentPage > 1) {
                currentPage--;

                renderFilms();
                scrollToFilms();
            }
        }
    );

    pagination.appendChild(
        previous
    );

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {
        const button =
            document.createElement(
                "button"
            );

        button.type = "button";
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add(
                "active"
            );
        }

        button.addEventListener(
            "click",
            () => {
                currentPage = page;

                renderFilms();
                scrollToFilms();
            }
        );

        pagination.appendChild(
            button
        );
    }

    const next =
        document.createElement("button");

    next.type = "button";
    next.textContent = "›";
    next.disabled =
        currentPage === totalPages;

    next.addEventListener(
        "click",
        () => {
            if (
                currentPage <
                totalPages
            ) {
                currentPage++;

                renderFilms();
                scrollToFilms();
            }
        }
    );

    pagination.appendChild(next);
}


function scrollToFilms() {
    if (!filmsGrid) {
        return;
    }

    const top =
        filmsGrid.getBoundingClientRect()
            .top +
        window.scrollY -
        30;

    window.scrollTo({
        top,
        behavior: "smooth"
    });
}


// dropdown select
function showPersonSuggestions(
    input,
    suggestionBox
) {
    const query =
        formatName(
            input.value
        );

    suggestionBox.innerHTML = "";

    if (query.length < 2) {
        suggestionBox.classList.remove(
            "active"
        );

        return;
    }

    const matches = new Map();

    films.forEach(film => {
        const castNames =
            getCastNames(
                film.cast
            );

        castNames.forEach(name => {
            const normalized =
                formatName(name);

            if (
                normalized.includes(query) &&
                !matches.has(normalized)
            ) {
                matches.set(
                    normalized,
                    name
                );
            }
        });
    });

    const names =
        Array.from(
            matches.values()
        )
        .sort((a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity: "base"
                }
            )
        )
        .slice(0, 10);

    if (names.length === 0) {
        suggestionBox.classList.remove(
            "active"
        );

        return;
    }

    names.forEach(name => {
        const button =
            document.createElement(
                "button"
            );

        button.type = "button";
        button.className =
            "person-suggestion";

        button.textContent =
            name;

        button.addEventListener(
            "click",
            () => {
                input.value = name;

                suggestionBox.innerHTML =
                    "";

                suggestionBox.classList.remove(
                    "active"
                );
            }
        );

        suggestionBox.appendChild(
            button
        );
    });

    suggestionBox.classList.add(
        "active"
    );
}


// cast lookup
function findPersonInCast(
    film,
    searchName
) {
    const search =
        formatName(
            searchName
        );

    if (!search) {
        return false;
    }

    const castNames =
        getCastNames(
            film.cast
        );

    return castNames.some(name => {
        const normalizedName =
            formatName(name);

        return (
            normalizedName === search ||
            normalizedName.includes(search) ||
            search.includes(normalizedName)
        );
    });
}


// director lookup
function findPersonAsDirector(
    film,
    searchName
) {
    const search =
        formatName(
            searchName
        );

    if (!search) {
        return false;
    }

    const directorNames =
        getDirectorNames(
            film.director
        );

    return directorNames.some(name => {
        const normalizedName =
            formatName(name);

        return (
            normalizedName === search ||
            normalizedName.includes(search) ||
            search.includes(normalizedName)
        );
    });
}


// advance search to see common films of 2 people
// to add future: can add multiple lines cast
function findCommonFilms() {
    const nameOne =
        personOne.value.trim();

    const nameTwo =
        personTwo.value.trim();

    commonFilmsResults.innerHTML =
        "";

    if (!nameOne || !nameTwo) {
        commonFilmsResults.innerHTML = `
            <div class="common-films-empty">
                ENTER TWO NAMES
            </div>
        `;

        return;
    }

    const commonFilms =
        films.filter(film =>
            findPersonInCast(
                film,
                nameOne
            ) &&
            findPersonInCast(
                film,
                nameTwo
            )
        );

    if (commonFilms.length === 0) {
        commonFilmsResults.innerHTML = `
            <div class="common-films-empty">
                NO COMMON FILMS FOUND
            </div>
        `;

        return;
    }

    commonFilms.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }

        return String(a.title || "")
            .localeCompare(
                String(b.title || ""),
                undefined,
                {
                    sensitivity: "base"
                }
            );
    });

    commonFilmsResults.innerHTML =
        commonFilms
            .map(film => `
                <div class="common-film-result">

                    <div class="common-film-poster">
                        <img
                            src="${escapeHTML(
                                film.poster || ""
                            )}"
                            alt="${escapeHTML(
                                film.title || ""
                            )}"
                        >
                    </div>

                    <div class="common-film-info">

                        <div class="common-film-year">
                            ${escapeHTML(
                                film.year || ""
                            )}
                        </div>

                        <div class="common-film-title">
                            ${escapeHTML(
                                film.title || ""
                            )}
                        </div>

                        <div class="common-film-people">

                            <span class="common-film-person">
                                ${escapeHTML(
                                    nameOne
                                )}
                            </span>

                            <span class="common-film-person">
                                ${escapeHTML(
                                    nameTwo
                                )}
                            </span>

                        </div>

                    </div>

                </div>
            `)
            .join("");
}


function showFilmographySuggestions() {
    const query =
        formatName(
            filmographyPerson.value
        );

    filmographySuggestions.innerHTML =
        "";

    if (query.length < 2) {
        filmographySuggestions.classList.remove(
            "active"
        );

        return;
    }

    const matches = new Map();

    films.forEach(film => {
        const castNames =
            getCastNames(
                film.cast
            );

        castNames.forEach(name => {
            const normalized =
                formatName(name);

            if (
                normalized.includes(query) &&
                !matches.has(normalized)
            ) {
                matches.set(
                    normalized,
                    name
                );
            }
        });
    });

    const names =
        Array.from(
            matches.values()
        )
        .sort((a, b) =>
            a.localeCompare(
                b,
                undefined,
                {
                    sensitivity: "base"
                }
            )
        )
        .slice(0, 10);

    if (names.length === 0) {
        filmographySuggestions.classList.remove(
            "active"
        );

        return;
    }

    names.forEach(name => {
        const button =
            document.createElement(
                "button"
            );

        button.type = "button";
        button.className =
            "person-suggestion";

        button.textContent =
            name;

        button.addEventListener(
            "click",
            () => {
                filmographyPerson.value =
                    name;

                filmographySuggestions.innerHTML =
                    "";

                filmographySuggestions.classList.remove(
                    "active"
                );

                findFilmography();
            }
        );

        filmographySuggestions.appendChild(
            button
        );
    });

    filmographySuggestions.classList.add(
        "active"
    );
}


// find list of all films for an actor
function findFilmography(
    mode = null
) {
    const searchName =
        filmographyPerson.value.trim();

    filmographyResults.innerHTML =
        "";

    if (!mode) {
        mode =
            filmographyPerson.dataset.mode ||
            "cast";
    }

    if (!searchName) {
        filmographyResults.innerHTML = `
            <div class="common-films-empty">
                ENTER A NAME
            </div>
        `;

        return;
    }

    let matchingFilms = [];

    if (mode === "director") {
        matchingFilms =
            films.filter(film =>
                findPersonAsDirector(
                    film,
                    searchName
                )
            );
    } else {
        matchingFilms =
            films.filter(film =>
                findPersonInCast(
                    film,
                    searchName
                )
            );
    }

    if (matchingFilms.length === 0) {
        filmographyResults.innerHTML = `
            <div class="common-films-empty">
                NO FILMS FOUND
            </div>
        `;

        return;
    }

    matchingFilms.sort((a, b) => {
        if (a.year !== b.year) {
            return b.year - a.year;
        }

        return String(a.title || "")
            .localeCompare(
                String(b.title || ""),
                undefined,
                {
                    sensitivity: "base"
                }
            );
    });

    filmographyResults.innerHTML = `
        <div class="filmography-count">
            ${matchingFilms.length}
            FILM${matchingFilms.length === 1 ? "" : "S"}
            FOUND
        </div>
    `;

    matchingFilms.forEach(film => {

        let roleHTML = "";

        if (mode === "director") {
            roleHTML = `
                <span class="filmography-role">
                    DIRECTOR
                </span>
            `;
        } else {
            const castNames =
                getCastNames(
                    film.cast
                );

            const matchedCastName =
                castNames.find(name =>
                    findPersonInCast(
                        {
                            cast: [name]
                        },
                        searchName
                    )
                );

            roleHTML =
                matchedCastName
                    ? `
                        <span class="filmography-role">
                            ${escapeHTML(
                                matchedCastName
                            )}
                        </span>
                    `
                    : "";
        }

        const result =
            document.createElement(
                "div"
            );

        result.className =
            "filmography-result";

        result.innerHTML = `
            <div class="filmography-poster">

                <img
                    src="${escapeHTML(
                        film.poster || ""
                    )}"
                    alt="${escapeHTML(
                        film.title || ""
                    )}"
                >

            </div>

            <div class="filmography-info">

                <div class="filmography-year">
                    ${escapeHTML(
                        film.year || ""
                    )}
                </div>

                <div class="filmography-title">
                    ${escapeHTML(
                        film.title || ""
                    )}
                </div>

                ${roleHTML}

            </div>
        `;

        filmographyResults.appendChild(
            result
        );
    });
}


// THE MOUNT RUSHMORE TOPIC MADE ME DO IT HAHAHAHA
function buildCastRanking() {
    if (!castRanking) {
        return;
    }

    const castCounts =
        new Map();

    films.forEach(film => {
        const castNames =
            getCastNames(
                film.cast
            );

        const countedInFilm =
            new Set();

        castNames.forEach(name => {
            const normalized =
                formatName(name);

            if (
                !normalized ||
                countedInFilm.has(
                    normalized
                )
            ) {
                return;
            }

            countedInFilm.add(
                normalized
            );

            if (
                !castCounts.has(
                    normalized
                )
            ) {
                castCounts.set(
                    normalized,
                    {
                        name: name,
                        count: 0
                    }
                );
            }

            castCounts.get(
                normalized
            ).count++;
        });
    });

    const rankings =
    Array.from(
        directorCounts.values()
    )
    .filter(person => person.count > 1)
    .sort((a, b) => {
        if (a.count !== b.count) {
            return b.count - a.count;
        }

        return a.name.localeCompare(
            b.name,
            undefined,
            {
                sensitivity: "base"
            }
        );
    });

    if (rankings.length === 0) {
        castRanking.innerHTML = `
            <div class="empty-films">
                NO CAST DATA FOUND
            </div>
        `;

        return;
    }

    castRanking.innerHTML =
        rankings
            .map(
                (person, index) => `
                    <div
                        class="cast-ranking-card"
                        data-person="${escapeHTML(
                            person.name
                        )}"
                    >

                        <div class="cast-rank">
                            ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </div>

                        <div class="cast-name">
                            ${escapeHTML(
                                person.name
                            )}
                        </div>

                        <div class="cast-film-count">
                            ${person.count}
                            FILM${person.count === 1 ? "" : "S"}
                        </div>

                    </div>
                `
            )
            .join("");

    castRanking
        .querySelectorAll(
            ".cast-ranking-card"
        )
        .forEach(card => {
            card.addEventListener(
                "click",
                () => {
                    const person =
                        card.dataset.person;

                    openFilmography(
                        person,
                        "cast"
                    );
                }
            );
        });
}


// director ranking
function buildDirectorsRanking() {
    if (!directorsRanking) {
        return;
    }

    const directorCounts =
        new Map();

    films.forEach(film => {
        const directorNames =
            getDirectorNames(
                film.director
            );

        const countedInFilm =
            new Set();

        directorNames.forEach(name => {
            const normalized =
                formatName(name);

            if (
                !normalized ||
                countedInFilm.has(
                    normalized
                )
            ) {
                return;
            }

            countedInFilm.add(
                normalized
            );

            if (
                !directorCounts.has(
                    normalized
                )
            ) {
                directorCounts.set(
                    normalized,
                    {
                        name: name,
                        count: 0
                    }
                );
            }

            directorCounts.get(
                normalized
            ).count++;
        });
    });

    const rankings =
        Array.from(
            directorCounts.values()
        )
        .sort((a, b) => {
            if (a.count !== b.count) {
                return b.count - a.count;
            }

            return a.name.localeCompare(
                b.name,
                undefined,
                {
                    sensitivity: "base"
                }
            );
        })
        .slice(0, 20);

    if (rankings.length === 0) {
        directorsRanking.innerHTML = `
            <div class="empty-films">
                NO DIRECTOR DATA FOUND
            </div>
        `;

        return;
    }

    directorsRanking.innerHTML =
        rankings
            .map(
                (person, index) => `
                    <div
                        class="cast-ranking-card"
                        data-person="${escapeHTML(
                            person.name
                        )}"
                    >

                        <div class="cast-rank">
                            ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </div>

                        <div class="cast-name">
                            ${escapeHTML(
                                person.name
                            )}
                        </div>

                        <div class="cast-film-count">
                            ${person.count}
                            FILM${person.count === 1 ? "" : "S"}
                        </div>

                    </div>
                `
            )
            .join("");

    directorsRanking
        .querySelectorAll(
            ".cast-ranking-card"
        )
        .forEach(card => {
            card.addEventListener(
                "click",
                () => {
                    const person =
                        card.dataset.person;

                    openFilmography(
                        person,
                        "director"
                    );
                }
            );
        });
}


// hotspot (?) clickable
function openFilmography(
    person,
    mode = "cast"
) {
    if (
        !filmographyModal ||
        !filmographyPerson
    ) {
        return;
    }

    filmographyModal.classList.add(
        "active"
    );

    filmographyPerson.value =
        person;

    filmographyPerson.dataset.mode =
        mode;

    filmographySuggestions.innerHTML =
        "";

    filmographySuggestions.classList.remove(
        "active"
    );

    if (mode === "director") {

        if (filmographyLabel) {
            filmographyLabel.textContent =
                "CINEMALAYA DIRECTOR DATABASE";
        }

        if (filmographyTitle) {
            filmographyTitle.textContent =
                "DIRECTOR FILMOGRAPHY";
        }

        filmographyPerson.placeholder =
            "SEARCH DIRECTOR...";

    } else {

        if (filmographyLabel) {
            filmographyLabel.textContent =
                "ACTOR / CAST DATABASE";
        }

        if (filmographyTitle) {
            filmographyTitle.textContent =
                "FILMOGRAPHY";
        }

        filmographyPerson.placeholder =
            "SEARCH CAST MEMBER...";
    }

    findFilmography(mode);
}


// home
function showHome() {
    if (castSection) {
        castSection.classList.remove(
            "active"
        );
    }

    if (directorsSection) {
        directorsSection.classList.remove(
            "active"
        );
    }

    if (filmsGrid) {
        filmsGrid.style.display = "";
    }

    if (pagination) {
        pagination.style.display = "";
    }

    if (yearFilter) {
        yearFilter.value = "all";
    }

    if (watchFilter) {
        watchFilter.value = "all";
    }

    if (searchInput) {
        searchInput.value = "";
    }

    currentPage = 1;

    renderFilms();

    if (homeButton) {
        homeButton.classList.add(
            "active"
        );
    }

    if (castButton) {
        castButton.classList.remove(
            "active"
        );
    }

    if (directorsButton) {
        directorsButton.classList.remove(
            "active"
        );
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// cast list
function showCast() {
    if (filmsGrid) {
        filmsGrid.style.display =
            "none";
    }

    if (pagination) {
        pagination.style.display =
            "none";
    }

    if (castSection) {
        castSection.classList.add(
            "active"
        );
    }

    if (directorsSection) {
        directorsSection.classList.remove(
            "active"
        );
    }

    if (homeButton) {
        homeButton.classList.remove(
            "active"
        );
    }

    if (castButton) {
        castButton.classList.add(
            "active"
        );
    }

    if (directorsButton) {
        directorsButton.classList.remove(
            "active"
        );
    }

    buildCastRanking();

    castSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// director list
function showDirectors() {
    if (filmsGrid) {
        filmsGrid.style.display =
            "none";
    }

    if (pagination) {
        pagination.style.display =
            "none";
    }

    if (castSection) {
        castSection.classList.remove(
            "active"
        );
    }

    if (directorsSection) {
        directorsSection.classList.add(
            "active"
        );
    }

    if (homeButton) {
        homeButton.classList.remove(
            "active"
        );
    }

    if (castButton) {
        castButton.classList.remove(
            "active"
        );
    }

    if (directorsButton) {
        directorsButton.classList.add(
            "active"
        );
    }

    buildDirectorsRanking();

    directorsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


if (yearFilter) {
    yearFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;

            if (castSection) {
                castSection.classList.remove(
                    "active"
                );
            }

            if (directorsSection) {
                directorsSection.classList.remove(
                    "active"
                );
            }

            filmsGrid.style.display = "";
            pagination.style.display = "";

            if (homeButton) {
                homeButton.classList.add(
                    "active"
                );
            }

            if (castButton) {
                castButton.classList.remove(
                    "active"
                );
            }

            if (directorsButton) {
                directorsButton.classList.remove(
                    "active"
                );
            }

            renderFilms();
        }
    );
}


if (watchFilter) {
    watchFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;

            if (castSection) {
                castSection.classList.remove(
                    "active"
                );
            }

            if (directorsSection) {
                directorsSection.classList.remove(
                    "active"
                );
            }

            filmsGrid.style.display = "";
            pagination.style.display = "";

            if (homeButton) {
                homeButton.classList.add(
                    "active"
                );
            }

            if (castButton) {
                castButton.classList.remove(
                    "active"
                );
            }

            if (directorsButton) {
                directorsButton.classList.remove(
                    "active"
                );
            }

            renderFilms();
        }
    );
}


if (searchInput) {
    searchInput.addEventListener(
        "input",
        () => {
            currentPage = 1;

            if (castSection) {
                castSection.classList.remove(
                    "active"
                );
            }

            if (directorsSection) {
                directorsSection.classList.remove(
                    "active"
                );
            }

            filmsGrid.style.display = "";
            pagination.style.display = "";

            if (homeButton) {
                homeButton.classList.add(
                    "active"
                );
            }

            if (castButton) {
                castButton.classList.remove(
                    "active"
                );
            }

            if (directorsButton) {
                directorsButton.classList.remove(
                    "active"
                );
            }

            renderFilms();
        }
    );
}


if (homeButton) {
    homeButton.addEventListener(
        "click",
        showHome
    );
}


/* CAST */

if (castButton) {
    castButton.addEventListener(
        "click",
        showCast
    );
}


/* DIRECTORS */

if (directorsButton) {
    directorsButton.addEventListener(
        "click",
        showDirectors
    );
}


// into pop-up
if (
    developerModal &&
    developerClose
) {
    developerClose.addEventListener(
        "click",
        () => {
            developerModal.style.display =
                "none";
        }
    );

    developerModal.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                developerModal
            ) {
                developerModal.style.display =
                    "none";
            }
        }
    );
}


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

            commonFilmsResults.innerHTML =
                "";

            personOne.value = "";
            personTwo.value = "";

            personOneSuggestions.innerHTML =
                "";

            personTwoSuggestions.innerHTML =
                "";

            personOneSuggestions.classList.remove(
                "active"
            );

            personTwoSuggestions.classList.remove(
                "active"
            );

            personOne.focus();
        }
    );
}


if (commonFilmsClose) {
    commonFilmsClose.addEventListener(
        "click",
        () => {
            commonFilmsModal.classList.remove(
                "active"
            );
        }
    );
}


if (commonFilmsModal) {
    commonFilmsModal.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                commonFilmsModal
            ) {
                commonFilmsModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


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


if (findCommonFilmsButton) {
    findCommonFilmsButton.addEventListener(
        "click",
        findCommonFilms
    );
}


if (personOne) {
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


if (personTwo) {
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

            filmographyPerson.value =
                "";

            filmographyPerson.dataset.mode =
                "cast";

            if (filmographyLabel) {
                filmographyLabel.textContent =
                    "ACTOR / CAST DATABASE";
            }

            if (filmographyTitle) {
                filmographyTitle.textContent =
                    "FILMOGRAPHY";
            }

            filmographyPerson.placeholder =
                "SEARCH CAST MEMBER...";

            filmographySuggestions.innerHTML =
                "";

            filmographySuggestions.classList.remove(
                "active"
            );

            filmographyResults.innerHTML =
                "";

            filmographyPerson.focus();
        }
    );
}


if (filmographyClose) {
    filmographyClose.addEventListener(
        "click",
        () => {
            filmographyModal.classList.remove(
                "active"
            );
        }
    );
}


if (filmographyModal) {
    filmographyModal.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                filmographyModal
            ) {
                filmographyModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


if (
    filmographyPerson &&
    filmographySuggestions
) {
    filmographyPerson.addEventListener(
        "input",
        showFilmographySuggestions
    );
}


if (findFilmographyButton) {
    findFilmographyButton.addEventListener(
        "click",
        () => {
            findFilmography();
        }
    );
}


if (filmographyPerson) {
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


/* START */

loadFilms();
