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

const filmsGrid = document.getElementById("filmsGrid");
const pagination = document.getElementById("pagination");
const yearFilter = document.getElementById("yearFilter");
const watchFilter = document.getElementById("watchFilter");
const searchInput = document.getElementById("searchInput");

const homeButton = document.getElementById("homeButton");
const castButton = document.getElementById("castButton");

const castSection = document.getElementById("castSection");
const castRanking = document.getElementById("castRanking");

const developerModal =
    document.getElementById("developerModal");

const developerClose =
    document.getElementById("developerClose");

const findPeopleButton =
    document.getElementById("findPeopleButton");

const commonFilmsModal =
    document.getElementById("commonFilmsModal");

const commonFilmsClose =
    document.getElementById("commonFilmsClose");

const findCommonFilmsButton =
    document.getElementById("findCommonFilms");

const personOne =
    document.getElementById("personOne");

const personTwo =
    document.getElementById("personTwo");

const personOneSuggestions =
    document.getElementById("personOneSuggestions");

const personTwoSuggestions =
    document.getElementById("personTwoSuggestions");

const commonFilmsResults =
    document.getElementById("commonFilmsResults");

const filmographyButton =
    document.getElementById("filmographyButton");

const filmographyModal =
    document.getElementById("filmographyModal");

const filmographyClose =
    document.getElementById("filmographyClose");

const filmographyPerson =
    document.getElementById("filmographyPerson");

const filmographySuggestions =
    document.getElementById("filmographySuggestions");

const findFilmographyButton =
    document.getElementById("findFilmography");

const filmographyResults =
    document.getElementById("filmographyResults");

let films = [];

let currentPage = 1;

const filmsPerPage = 15;


/* LOAD FILMS */

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

        populateYears();
        populateWatchFilters();

        buildCastRanking();

        currentPage = 1;

        renderFilms();

    } catch (error) {
        console.error(
            "FILM DATABASE ERROR:",
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


/* YEARS */

function populateYears() {
    if (!yearFilter) {
        return;
    }

    for (
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


/* WATCH FILTER */

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


/* FILTER FILMS */

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


/* ESCAPE HTML */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* NORMALIZE NAME */

function normalizeName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}


/* CAST NAMES */

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


/* DIRECTOR NAMES */

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


/* CAST TAGS */

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


/* DIRECTOR TAGS */

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


/* WATCH OPTIONS */

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


/* FILM CARD */

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


/* SEE MORE */

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


/* PAGINATION */

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


/* SCROLL */

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


/* PERSON SUGGESTIONS */

function showPersonSuggestions(
    input,
    suggestionBox
) {
    const query =
        normalizeName(
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
                normalizeName(name);

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


/* FIND PERSON IN CAST */

function findPersonInCast(
    film,
    searchName
) {
    const search =
        normalizeName(
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
            normalizeName(name);

        return (
            normalizedName === search ||
            normalizedName.includes(search) ||
            search.includes(normalizedName)
        );
    });
}


/* COMMON FILMS */

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


/* FILMOGRAPHY SUGGESTIONS */

function showFilmographySuggestions() {
    const query =
        normalizeName(
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
                normalizeName(name);

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


/* FILMOGRAPHY */

function findFilmography() {
    const searchName =
        filmographyPerson.value.trim();

    filmographyResults.innerHTML =
        "";

    if (!searchName) {
        filmographyResults.innerHTML = `
            <div class="common-films-empty">
                ENTER A NAME
            </div>
        `;

        return;
    }

    const matchingFilms =
        films.filter(film =>
            findPersonInCast(
                film,
                searchName
            )
        );

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

                ${
                    matchedCastName
                        ? `
                            <span class="filmography-role">
                                ${escapeHTML(
                                    matchedCastName
                                )}
                            </span>
                        `
                        : ""
                }

            </div>
        `;

        filmographyResults.appendChild(
            result
        );
    });
}


/* CAST RANKING */

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
                normalizeName(name);

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
            castCounts.values()
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
        .slice(0, 15);

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

                    openFilmography(person);
                }
            );
        });
}


/* OPEN FILMOGRAPHY */

function openFilmography(person) {
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

    filmographySuggestions.innerHTML =
        "";

    filmographySuggestions.classList.remove(
        "active"
    );

    findFilmography();
}


/* SHOW HOME */

function showHome() {
    if (castSection) {
        castSection.classList.remove(
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

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* SHOW CAST */

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

    buildCastRanking();

    castSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* YEAR FILTER */

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

            renderFilms();
        }
    );
}


/* WATCH FILTER */

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

            renderFilms();
        }
    );
}


/* SEARCH */

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

            renderFilms();
        }
    );
}


/* HOME */

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


/* DEVELOPER MODAL */

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


/* COMMON FILMS OPEN */

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


/* COMMON FILMS CLOSE */

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


/* COMMON FILMS OUTSIDE CLICK */

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


/* PERSON ONE */

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


/* PERSON TWO */

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


/* FIND COMMON */

if (findCommonFilmsButton) {
    findCommonFilmsButton.addEventListener(
        "click",
        findCommonFilms
    );
}


/* COMMON ENTER */

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


/* FILMOGRAPHY OPEN */

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


/* FILMOGRAPHY CLOSE */

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


/* FILMOGRAPHY OUTSIDE CLICK */

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


/* FILMOGRAPHY AUTOCOMPLETE */

if (
    filmographyPerson &&
    filmographySuggestions
) {
    filmographyPerson.addEventListener(
        "input",
        showFilmographySuggestions
    );
}


/* FIND FILMOGRAPHY */

if (findFilmographyButton) {
    findFilmographyButton.addEventListener(
        "click",
        findFilmography
    );
}


/* FILMOGRAPHY ENTER */

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


/* CLOSE SUGGESTIONS */

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
