const platformNames = {
    netflix: "Netflix",
    juanflix: "Juanflix",
    ccp: "CCP",
    youtube: "YouTube",
    prime: "Prime Video",
    appletv: "Apple TV",
    iwant: "iWant",
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

const developerModal =
    document.getElementById("developerModal");

const developerClose =
    document.getElementById("developerClose");

let films = [];

let currentPage = 1;

const filmsPerPage = 15;

async function loadFilms() {
    try {
        const response =
            await fetch("./films.json", {
                cache: "no-store"
            });

        if (!response.ok) {
            throw new Error(
                `films.json returned ${response.status} ${response.statusText}`
            );
        }

        const data =
            await response.json();

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

        currentPage = 1;

        renderFilms();

    } catch (error) {
        console.error(
            "FILM DATABASE ERROR:",
            error
        );

        filmsGrid.innerHTML = `
            <div class="empty-films">
                UNABLE TO LOAD FILMS
                <br><br>
                <small>
                    ${error.message}
                </small>
            </div>
        `;

        if (pagination) {
            pagination.innerHTML = "";
        }
    }
}

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
    ["external", "External"],
    ["none", "No known source"],
    ["now_showing", "Now Showing"]
];

    platforms.forEach(
        ([value, label]) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = value;
            option.textContent = label;

            watchFilter.appendChild(
                option
            );
        }
    );
}

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
                source => {
                    return source &&
                        source.type ===
                        selectedWatch;
                }
            );
        })

        .filter(film => {
            if (searchTerm === "") {
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

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createCastTags(cast) {
    if (!cast) {
        return `
            <span class="cast-unavailable">
                Cast information unavailable
            </span>
        `;
    }

    const names = Array.isArray(cast)
        ? cast
        : String(cast)
            .split(",")
            .map(name => name.trim());

    const validNames =
        names.filter(name => name);

    if (validNames.length === 0) {
        return `
            <span class="cast-unavailable">
                Cast information unavailable
            </span>
        `;
    }

    return validNames
        .map(name => `
            <span class="cast-tag">
                ${escapeHTML(name)}
            </span>
        `)
        .join("");
}

function createDirectorTag(director) {
    if (!director) {
        return `
            <span class="director-unavailable">
                Director information unavailable
            </span>
        `;
    }

    const names = Array.isArray(director)
        ? director
        : String(director)
            .split(/,|&/)
            .map(name => name.trim());

    const validNames =
        names.filter(name => name);

    if (validNames.length === 0) {
        return `
            <span class="director-unavailable">
                Director information unavailable
            </span>
        `;
    }

    return validNames
        .map(name => `
            <span class="director-tag">
                ${escapeHTML(name)}
            </span>
        `)
        .join("");
}

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

            if (
                (
                    type === "external" ||
                    type === "youtube" ||
                    type === "prime"
                ) &&
                source.url
            ) {
                return `
                    <a
                        class="platform ${type}"
                        href="${escapeHTML(source.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${name}
                    </a>
                `;
            }

            return `
                <span
                    class="platform ${type}"
                >
                    ${name}
                </span>
            `;
        })
        .join("");

    return html;
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
            film.watch || [],
            film.now_showing
        );

    const castTags =
        createCastTags(
            film.cast
        );

    const directorTag =
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
                ${directorTag}
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
            targetType === "cast"
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

    if (
        currentPage > totalPages
    ) {
        currentPage =
            totalPages;
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

    pageFilms.forEach(
        (film, index) => {
            const card =
                createFilmCard(
                    film,
                    startIndex + index
                );

            filmsGrid.appendChild(
                card
            );
        }
    );

    renderPagination(
        totalPages
    );
}

function renderPagination(
    totalPages
) {
    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const previous =
        document.createElement(
            "button"
        );

    previous.type = "button";
    previous.textContent = "‹";
    previous.disabled =
        currentPage === 1;

    previous.setAttribute(
        "aria-label",
        "Previous page"
    );

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

        if (
            page === currentPage
        ) {
            button.classList.add(
                "active"
            );
        }

        button.setAttribute(
            "aria-label",
            `Page ${page}`
        );

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
        document.createElement(
            "button"
        );

    next.type = "button";
    next.textContent = "›";
    next.disabled =
        currentPage === totalPages;

    next.setAttribute(
        "aria-label",
        "Next page"
    );

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

    pagination.appendChild(
        next
    );
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

if (yearFilter) {
    yearFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;
            renderFilms();
        }
    );
}

if (watchFilter) {
    watchFilter.addEventListener(
        "change",
        () => {
            currentPage = 1;
            renderFilms();
        }
    );
}

if (searchInput) {
    searchInput.addEventListener(
        "input",
        () => {
            currentPage = 1;
            renderFilms();
        }
    );
}

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

loadFilms();
