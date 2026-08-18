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
  none: "No known source",
};

const filmsGrid = document.getElementById("filmsGrid");

const pagination = document.getElementById("pagination");

const yearFilter = document.getElementById("yearFilter");

const watchFilter = document.getElementById("watchFilter");

const searchInput = document.getElementById("searchInput");

/* =========================================================
   NAVIGATION
   ========================================================= */

const homeButton = document.getElementById("homeButton");

const castButton = document.getElementById("castButton");

const directorsButton = document.getElementById("directorsButton");

const findPeopleButton = document.getElementById("findPeopleButton");

const filmographyButton = document.getElementById("filmographyButton");

/* =========================================================
   SECTIONS
   ========================================================= */

const filmsSection = document.getElementById("filmsSection");

const filmControls = document.getElementById("filmControls");

const castSection = document.getElementById("castSection");

const castRanking = document.getElementById("castRanking");

const directorsSection = document.getElementById("directorsSection");

const directorsRanking = document.getElementById("directorsRanking");

/* =========================================================
   DEVELOPER MODAL
   ========================================================= */

const developerModal = document.getElementById("developerModal");

const developerClose = document.getElementById("developerClose");

/* =========================================================
   COMMON FILMS
   ========================================================= */

const commonFilmsModal = document.getElementById("commonFilmsModal");

const commonFilmsClose = document.getElementById("commonFilmsClose");

const findCommonFilmsButton = document.getElementById("findCommonFilms");

const commonFilmsResults = document.getElementById("commonFilmsResults");

/* =========================================================
   COMMON FILMS INPUTS
   ========================================================= */

const personOne = document.getElementById("personOne");

const personTwo = document.getElementById("personTwo");

const personOneSuggestions = document.getElementById("personOneSuggestions");

const personTwoSuggestions = document.getElementById("personTwoSuggestions");

/* =========================================================
   FILMOGRAPHY
   ========================================================= */

const filmographyModal = document.getElementById("filmographyModal");

const filmographyClose = document.getElementById("filmographyClose");

const filmographyPerson = document.getElementById("filmographyPerson");

const filmographySuggestions = document.getElementById(
  "filmographySuggestions",
);

const filmographyResults = document.getElementById("filmographyResults");

const findFilmographyButton = document.getElementById("findFilmography");

/* =========================================================
   FILM DETAILS MODAL
   ========================================================= */

const filmDetailsModal = document.getElementById("filmDetailsModal");

const filmDetailsClose = document.getElementById("filmDetailsClose");

const filmDetailsHeader = document.getElementById("filmDetailsHeader");

const filmDetailsSynopsis = document.getElementById("filmDetailsSynopsis");

const filmDetailsPeople = document.getElementById("filmDetailsPeople");

const filmDetailsProduction = document.getElementById("filmDetailsProduction");

const filmDetailsWatch = document.getElementById("filmDetailsWatch");

const filmDetailsAwards = document.getElementById("filmDetailsAwards");

/* =========================================================
   THEME
   ========================================================= */

const themeToggle = document.getElementById("themeToggle");

const themeLabel = document.getElementById("themeLabel");

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
  film: "Best Film",

  jury: "Special Jury Award",

  audience: "Audience Choice Award",

  direction: "Best Director",

  actor: "Best Actor",

  actress: "Best Actress",

  supporting_actor: "Best Supporting Actor",

  supporting_actress: "Best Supporting Actress",

  screenplay: "Best Screenplay",

  cinematography: "Best Cinematography",

  editing: "Best Editing",

  sound: "Best Sound",

  music: "Best Original Music Score",

  production: "Best Production Design",

  ensemble: "Best Ensemble",

  audience: "Audience Choice Award",

  netpac: "NETPAC Award",
};

/* =========================================================
   LOAD FILMS
   ========================================================= */

async function loadFilms() {
  try {
    const response = await fetch("./films.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `films.json returned ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("films.json must contain an array of films.");
    }

    films = data;

    /*
     * DEFAULT SORT
     *
     * Newest year first.
     * Within the same year:
     * alphabetical by title.
     */

    films.sort((a, b) => {
      if (Number(a.year) !== Number(b.year)) {
        return Number(b.year) - Number(a.year);
      }

      return String(a.title || "").localeCompare(
        String(b.title || ""),
        undefined,
        {
          sensitivity: "base",
        },
      );
    });

    populateYears();

    populateWatchFilters();

    buildCastRanking();

    buildDirectorsRanking();

    currentPage = 1;

    renderFilms();
  } catch (error) {
    console.error("Error loading films:", error);

    if (filmsGrid) {
      filmsGrid.innerHTML = `

                <div class="empty-films">

                    UNABLE TO LOAD FILMS

                    <br>
                    <br>

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

/* =========================================================
   POPULATE YEARS
   ========================================================= */

function populateYears() {
  if (!yearFilter) {
    return;
  }

  /*
   * Prevent duplicate options if
   * loadFilms() is ever called again.
   */

  yearFilter.innerHTML = `

        <option value="all">
            ALL YEARS
        </option>

    `;

  const years = [
    ...new Set(
      films
        .map((film) => Number(film.year))
        .filter((year) => !Number.isNaN(year)),
    ),
  ].sort((a, b) => b - a);

  years.forEach((year) => {
    const option = document.createElement("option");

    option.value = year;

    option.textContent = year;

    yearFilter.appendChild(option);
  });
}

/* =========================================================
   POPULATE WATCH FILTER
   ========================================================= */

function populateWatchFilters() {
  if (!watchFilter) {
    return;
  }

  watchFilter.innerHTML = `

        <option value="all">
            WHERE TO WATCH
        </option>

    `;

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

    ["now_showing", "Now Showing"],
  ];

  platforms.forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;

    option.textContent = label;

    watchFilter.appendChild(option);
  });
}

/* =========================================================
   FILTER FILMS
   ========================================================= */

function getFilteredFilms() {
  const selectedYear = yearFilter ? yearFilter.value : "all";

  const selectedWatch = watchFilter ? watchFilter.value : "all";

  const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

  return (
    films

      /* YEAR */

      .filter((film) => {
        if (selectedYear === "all") {
          return true;
        }

        return String(film.year) === String(selectedYear);
      })

      /* WATCH */

      .filter((film) => {
        if (selectedWatch === "all") {
          return true;
        }

        if (selectedWatch === "now_showing") {
          return film.now_showing === true;
        }

        if (!Array.isArray(film.watch)) {
          return false;
        }

        return film.watch.some(
          (source) => source && source.type === selectedWatch,
        );
      })

      /* SEARCH */

      .filter((film) => {
        if (!searchTerm) {
          return true;
        }

        return String(film.title || "")
          .toLowerCase()
          .includes(searchTerm);
      })

      /* SORT */

      .sort((a, b) => {
        /*
         * If a specific year is selected,
         * alphabetize the films.
         */

        if (selectedYear !== "all") {
          return String(a.title || "").localeCompare(
            String(b.title || ""),
            undefined,
            {
              sensitivity: "base",
            },
          );
        }

        /*
         * Otherwise newest year first,
         * then alphabetical.
         */

        if (Number(a.year) !== Number(b.year)) {
          return Number(b.year) - Number(a.year);
        }

        return String(a.title || "").localeCompare(
          String(b.title || ""),
          undefined,
          {
            sensitivity: "base",
          },
        );
      })
  );
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =========================================================
   FORMAT NAME
   ========================================================= */

function formatName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =========================================================
   GET CAST NAMES
   ========================================================= */

function getCastNames(cast) {
  if (!cast) {
    return [];
  }

  if (Array.isArray(cast)) {
    return cast

      .flatMap((name) => String(name).split(/,|&/))

      .map((name) => name.trim())

      .filter(Boolean);
  }

  return String(cast)
    .split(/,|&/)

    .map((name) => name.trim())

    .filter(Boolean);
}

function getGenreNames(genre) {
  if (!genre) {
    return [];
  }

  if (Array.isArray(genre)) {
    return genre
      .flatMap((item) => String(item).split(/,|&/))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return String(genre)
    .split(/,|&/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/* =========================================================
   GET DIRECTOR NAMES
   ========================================================= */

function getDirectorNames(director) {
  if (!director) {
    return [];
  }

  if (Array.isArray(director)) {
    return director

      .flatMap((name) => String(name).split(/,|&/))

      .map((name) => name.trim())

      .filter(Boolean);
  }

  return String(director)
    .split(/,|&/)

    .map((name) => name.trim())

    .filter(Boolean);
}

/* =========================================================
   GENERIC PEOPLE VALUE
   Used for production credits.
   ========================================================= */

function getPeopleNames(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value

      .flatMap((item) => {
        if (item && typeof item === "object") {
          return item.name || item.value || "";
        }

        return String(item);
      })

      .flatMap((item) => String(item).split(/,|&/))

      .map((item) => item.trim())

      .filter(Boolean);
  }

  if (typeof value === "object") {
    if (value.name) {
      return getPeopleNames(value.name);
    }

    if (value.value) {
      return getPeopleNames(value.value);
    }
  }

  return String(value)
    .split(/,|&/)

    .map((item) => item.trim())

    .filter(Boolean);
}

/* =========================================================
   CREATE CAST TAGS
   ========================================================= */

function createCastTags(cast) {
  const names = getCastNames(cast);

  if (names.length === 0) {
    return `

            <span class="cast-unavailable">
                Cast information unavailable
            </span>

        `;
  }

  return names

    .map(
      (name) => `

                <span class="cast-tag">
                    ${escapeHTML(name)}
                </span>

            `,
    )

    .join("");
}

/* =========================================================
   CREATE DIRECTOR TAGS
   ========================================================= */

function createDirectorTag(director) {
  const names = getDirectorNames(director);

  if (names.length === 0) {
    return `

            <span class="director-unavailable">
                Director information unavailable
            </span>

        `;
  }

  return names

    .map(
      (name) => `

                <span class="director-tag">
                    ${escapeHTML(name)}
                </span>

            `,
    )

    .join("");
}

/* =========================================================
   CREATE WATCH OPTIONS
   ========================================================= */

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

    .map((source) => {
      if (!source || !source.type) {
        return "";
      }

      const type = source.type;

      const name = platformNames[type] || "No known source";

      const clickableTypes = [
        "external",

        "youtube",

        "prime",

        "appletv",

        "iwant",

        "viva",
      ];

      if (clickableTypes.includes(type) && source.url) {
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

/* =========================================================
   CREATE FILM CARD
   ========================================================= */

function createFilmCard(film) {
  const card = document.createElement("article");

  card.className = "film-card";

  const watchOptions = createWatchOptions(film.watch || [], film.now_showing);

  const castTags = createCastTags(film.cast);

  const directorTags = createDirectorTag(film.director);

  card.innerHTML = `

        <div class="poster-wrap">

            <img
                src="${escapeHTML(film.poster || "")}"
                alt="${escapeHTML(film.title || "")}"
            >

        </div>


        <div class="film-info">


            <div class="film-year">
                ${escapeHTML(film.year || "")}
            </div>


            <div class="film-title">
                ${escapeHTML(film.title || "")}
            </div>


            <div class="film-description">
                ${escapeHTML(film.description || "")}
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

  /* =====================================================
       POSTER ERROR
       ===================================================== */

  const image = card.querySelector(".poster-wrap img");

  if (image) {
    image.addEventListener("error", function () {
      this.style.display = "none";

      const placeholder = document.createElement("div");

      placeholder.className = "poster-missing";

      placeholder.textContent = "POSTER NOT AVAILABLE";

      this.parentElement.appendChild(placeholder);
    });
  }

  setupSeeMore(card);

  /* =====================================================
       CARD CLICK
       ===================================================== */

  card.addEventListener("click", (event) => {
    /*
     * Don't open the film popup when
     * clicking a link/button inside
     * the card.
     */

    if (event.target.closest("a, button")) {
      return;
    }

    openFilmDetails(film);
  });

  return card;
}

/* =========================================================
   SEE MORE / SEE LESS
   ========================================================= */

function setupSeeMore(card) {
  const buttons = card.querySelectorAll(".see-more");

  buttons.forEach((button) => {
    const targetType = button.dataset.target;

    let target;

    if (targetType === "description") {
      target = card.querySelector(".film-description");
    }

    if (targetType === "cast") {
      target = card.querySelector(".film-cast");
    }

    if (!target) {
      button.remove();

      return;
    }

    requestAnimationFrame(() => {
      if (target.scrollHeight <= target.clientHeight + 1) {
        button.remove();
      }
    });

    button.addEventListener("click", () => {
      const expanded = target.classList.contains("expanded");

      if (expanded) {
        target.classList.remove("expanded");

        button.textContent = "SEE MORE";
      } else {
        target.classList.add("expanded");

        button.textContent = "SEE LESS";
      }
    });
  });
}

/* =========================================================
   RENDER FILMS
   ========================================================= */

function renderFilms() {
  if (!filmsGrid) {
    return;
  }

  filmsGrid.innerHTML = "";

  const filteredFilms = getFilteredFilms();

  const totalFilms = filteredFilms.length;

  const totalPages = Math.ceil(totalFilms / filmsPerPage);

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

  const startIndex = (currentPage - 1) * filmsPerPage;

  const endIndex = startIndex + filmsPerPage;

  const pageFilms = filteredFilms.slice(startIndex, endIndex);

  pageFilms.forEach((film) => {
    filmsGrid.appendChild(createFilmCard(film));
  });

  renderPagination(totalPages);
}

/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination(totalPages) {
  if (!pagination) {
    return;
  }

  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const previous = document.createElement("button");

  previous.type = "button";

  previous.textContent = "‹";

  previous.disabled = currentPage === 1;

  previous.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;

      renderFilms();

      scrollToFilms();
    }
  });

  pagination.appendChild(previous);

  for (let page = 1; page <= totalPages; page++) {
    const button = document.createElement("button");

    button.type = "button";

    button.textContent = page;

    if (page === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      currentPage = page;

      renderFilms();

      scrollToFilms();
    });

    pagination.appendChild(button);
  }

  const next = document.createElement("button");

  next.type = "button";

  next.textContent = "›";

  next.disabled = currentPage === totalPages;

  next.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;

      renderFilms();

      scrollToFilms();
    }
  });

  pagination.appendChild(next);
}

/* =========================================================
   SCROLL TO FILMS
   ========================================================= */

function scrollToFilms() {
  if (!filmsGrid) {
    return;
  }

  const top = filmsGrid.getBoundingClientRect().top + window.scrollY - 30;

  window.scrollTo({
    top,

    behavior: "smooth",
  });
}

/* =========================================================
   FILM DETAILS
   ========================================================= */

/*
 * Get a production credit.
 *
 * Supports different possible JSON names:
 *
 * producer / producers
 * screenplay / screenwriter
 * production_designer
 * productionDesigner
 * cinematographer
 * editor
 * sound
 * music
 */

function getCredit(film, keys) {
  for (const key of keys) {
    if (film[key] !== undefined && film[key] !== null && film[key] !== "") {
      return film[key];
    }
  }

  return "";
}

/* =========================================================
   CREATE CREDIT VALUE
   ========================================================= */

function createCreditValue(value) {
  const names = getPeopleNames(value);

  if (names.length === 0) {
    return `
            <span
                class="production-credit-value production-credit-empty"
            >
                —
            </span>
        `;
  }

  return `

        <div class="production-credit-tags">

            ${names
              .map(
                (name) => `
                        <span class="production-credit-value">
                            ${escapeHTML(name)}
                        </span>
                    `,
              )
              .join("")}

        </div>

    `;
}

/* =========================================================
   CREATE FILM DETAILS HEADER
   ========================================================= */

function createFilmDetailsHeader(film) {
  const poster = escapeHTML(film.poster || "");

  const title = escapeHTML(film.title || "");

  const year = escapeHTML(film.year || "");

  const directors = getDirectorNames(film.director);

  const cast = getCastNames(film.cast);

  const directorHTML = directors.length
    ? directors
        .map(
          (name) => `
                        <span class="film-details-director-tag">
                            ${escapeHTML(name)}
                        </span>
                    `,
        )
        .join("")
    : `
                <span class="director-unavailable">
                    Director information unavailable
                </span>
            `;

  const castHTML = cast.length
    ? cast
        .map(
          (name) => `
                        <span class="film-details-cast-tag">
                            ${escapeHTML(name)}
                        </span>
                    `,
        )
        .join("")
    : `
                <span class="cast-unavailable">
                    Cast information unavailable
                </span>
            `;

  return `

        <div class="film-details-poster">

            <img
                src="${poster}"
                alt="${title}"
            >

        </div>


        <div class="film-details-main">

            <div class="film-details-year">
                ${year}
            </div>


            <div class="film-details-title">
                ${title}
            </div>


            <div class="film-details-header-synopsis">

                <div class="film-details-label">
                    SYNOPSIS
                </div>

                <div class="film-details-full-description">
                    ${escapeHTML(film.description || "No synopsis available.")}
                </div>

            </div>


            <div class="film-details-header-people">

                <div class="film-details-person-group">

    <div class="film-details-label">
        DIRECTOR
    </div>

    <div class="film-details-director-tags">
        ${directorHTML}
    </div>


    <div class="film-details-label film-details-genre-label">
        GENRE
    </div>

    <div class="film-details-genre-tags">

        ${getGenreNames(film.genre)
          .map(
            (genre) => `
                        <span class="film-details-genre-tag">
                            ${escapeHTML(genre)}
                        </span>
                    `,
          )
          .join("")}

    </div>

</div>


                <div class="film-details-person-group">

                    <div class="film-details-label">
                        CAST
                    </div>

                    <div class="film-details-cast-tags">
                        ${castHTML}
                    </div>

                </div>

            </div>

        </div>

    `;
}

/* =========================================================
   CREATE PEOPLE SECTION
   ========================================================= */

function createFilmDetailsPeople(film) {
  const directors = getDirectorNames(film.director);

  const cast = getCastNames(film.cast);

  const directorHTML = directors.length
    ? directors
        .map(
          (name) => `

                        <span
                            class="film-details-director-tag"
                        >
                            ${escapeHTML(name)}
                        </span>

                    `,
        )
        .join("")
    : `

                <span
                    class="director-unavailable"
                >
                    Director information unavailable
                </span>

            `;

  const castHTML = cast.length
    ? cast
        .map(
          (name) => `

                        <span
                            class="film-details-cast-tag"
                        >
                            ${escapeHTML(name)}
                        </span>

                    `,
        )
        .join("")
    : `

                <span
                    class="cast-unavailable"
                >
                    Cast information unavailable
                </span>

            `;

  return `

        <div
            class="film-details-people-grid"
        >


            <div
                class="film-details-person-group"
            >

                <div
                    class="film-details-label"
                >
                    DIRECTOR
                </div>


                <div
                    class="film-details-director-tags"
                >
                    ${directorHTML}
                </div>

            </div>



            <div
                class="film-details-person-group"
            >

                <div
                    class="film-details-label"
                >
                    CAST
                </div>


                <div
                    class="film-details-cast-tags"
                >
                    ${castHTML}
                </div>

            </div>


        </div>

    `;
}

/* =========================================================
   CREATE PRODUCTION SECTION
   ========================================================= */

function createFilmDetailsProduction(film) {
  const credits = [
    {
      label: "PRODUCERS",

      keys: ["producers", "producer"],
    },

    {
      label: "SCREENPLAY",

      keys: ["screenplay", "screenwriter", "screenwriters"],
    },

    {
      label: "PRODUCTION DESIGNER",

      keys: [
        "production_designer",
        "productionDesigner",
        "production_design",
        "productionDesign",
      ],
    },

    {
      label: "CINEMATOGRAPHER",

      keys: [
        "cinematographer",
        "cinematography",
        "director_of_photography",
        "directorOfPhotography",
      ],
    },

    {
      label: "EDITOR",

      keys: ["editor", "editing"],
    },

    {
      label: "SOUND",

      keys: ["sound", "sound_designer", "soundDesigner"],
    },

    {
      label: "MUSIC",

      keys: ["music", "composer", "original_music", "originalMusic"],
    },
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
              .map((credit) => {
                const value = getCredit(film, credit.keys);

                return `

                                <div
                                    class="production-credit"
                                >

                                    <div
                                        class="production-credit-label"
                                    >
                                        ${escapeHTML(credit.label)}
                                    </div>


                                    ${createCreditValue(value)}

                                </div>

                            `;
              })
              .join("")}

        </div>

    `;
}

/* =========================================================
   CREATE WATCH SECTION
   ========================================================= */

function createFilmDetailsWatch(film) {
  const watchHTML = createWatchOptions(film.watch || [], film.now_showing);

  return `

        <div
            class="film-details-label"
        >
            WHERE TO WATCH
        </div>


        <div
            class="film-details-watch"
        >
            ${
              watchHTML ||
              `

                <span
                    class="platform none"
                >
                    NO KNOWN SOURCE
                </span>

            `
            }

        </div>

    `;
}

/* =========================================================
   AWARD DISPLAY NAME
   ========================================================= */

function getAwardDisplayName(key) {
  return (
    awardNames[key] ||
    key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

/* =========================================================
   CREATE AWARDS
   ========================================================= */

function createFilmDetailsAwards(film) {
  const awards = Array.isArray(film.awards) ? film.awards : [];

  const winningAwards = [];

  /*
   * Example:
   *
   * {
   *     "direction": true
   * }
   *
   * or:
   *
   * {
   *     "actor": true,
   *     "name": "Juan Dela Cruz"
   * }
   */

  awards.forEach((award) => {
    if (!award || typeof award !== "object") {
      return;
    }

    Object.keys(award).forEach((key) => {
      /*
       * Don't treat "name" as
       * an award itself.
       */

      if (key === "name") {
        return;
      }

      if (award[key] === true) {
        winningAwards.push({
          key,

          name: award.name || "",
        });
      }
    });
  });

  /*
   * Also support a simpler structure
   * if your JSON eventually uses:
   *
   * {
   *   "direction": true,
   *   "actor": true,
   *   "name": "..."
   * }
   */

  if (winningAwards.length === 0 && awards.length) {
    awards.forEach((award) => {
      if (!award || typeof award !== "object") {
        return;
      }

      Object.keys(award).forEach((key) => {
        if (key === "name") {
          return;
        }

        if (award[key] === true) {
          winningAwards.push({
            key,

            name: award.name || "",
          });
        }
      });
    });
  }

  if (winningAwards.length === 0) {
    return `

            <div
                class="film-details-label"
            >
                AWARDS WON
            </div>


            <div
                class="film-awards-empty"
            >
                NO AWARDS LISTED
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
                (award) => `

                            <div
                                class="film-award"
                            >

                                <div
                                    class="film-award-icon"
                                >
                                    🏆
                                </div>


                                <div
                                    class="film-award-content"
                                >

                                    <div class="film-award-name">
    ${escapeHTML(getAwardDisplayName(award.key))}
    (${escapeHTML(film.year || "")})
</div>


                                    ${
                                      award.name
                                        ? `

                                                <div
                                                    class="film-award-recipient"
                                                >
                                                    ${escapeHTML(award.name)}
                                                </div>

                                            `
                                        : ""
                                    }

                                </div>

                            </div>

                        `,
              )
              .join("")}

        </div>

    `;
}

/* =========================================================
   OPEN FILM DETAILS
   ========================================================= */

function openFilmDetails(film) {
  if (!filmDetailsModal) {
    return;
  }

  /*
   * Header
   */

  if (filmDetailsHeader) {
    filmDetailsHeader.innerHTML = createFilmDetailsHeader(film);
  }

  /*
   * Production credits
   */

  if (filmDetailsProduction) {
    filmDetailsProduction.innerHTML = createFilmDetailsProduction(film);
  }

  /*
   * Where to watch
   */

  if (filmDetailsWatch) {
    filmDetailsWatch.innerHTML = createFilmDetailsWatch(film);
  }

  /*
   * Awards
   */

  if (filmDetailsAwards) {
    filmDetailsAwards.innerHTML = createFilmDetailsAwards(film);
  }

  /*
   * Poster fallback
   */

  const poster = filmDetailsHeader
    ? filmDetailsHeader.querySelector(".film-details-poster img")
    : null;

  if (poster) {
    poster.addEventListener(
      "error",
      function () {
        this.style.display = "none";

        const placeholder = document.createElement("div");

        placeholder.className = "poster-missing";

        placeholder.textContent = "POSTER NOT AVAILABLE";

        this.parentElement.appendChild(placeholder);
      },
      {
        once: true,
      },
    );
  }

  /*
   * Open
   */

  filmDetailsModal.classList.add("active");

  document.body.style.overflow = "hidden";
}

/* =========================================================
   CLOSE FILM DETAILS
   ========================================================= */

function closeFilmDetails() {
  if (!filmDetailsModal) {
    return;
  }

  filmDetailsModal.classList.remove("active");

  document.body.style.overflow = "";
}

/* =========================================================
   PERSON SUGGESTIONS
   ========================================================= */

function showPersonSuggestions(input, suggestionBox) {
  if (!input || !suggestionBox) {
    return;
  }

  const query = formatName(input.value);

  suggestionBox.innerHTML = "";

  /*
   * Don't preload names.
   * Only search after 2 characters.
   */

  if (query.length < 2) {
    suggestionBox.classList.remove("active");

    return;
  }

  const matches = new Map();

  films.forEach((film) => {
    const castNames = getCastNames(film.cast);

    castNames.forEach((name) => {
      const normalized = formatName(name);

      if (normalized.includes(query) && !matches.has(normalized)) {
        matches.set(normalized, name);
      }
    });
  });

  const names = Array.from(matches.values())
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
      }),
    )
    .slice(0, 10);

  if (names.length === 0) {
    suggestionBox.classList.remove("active");

    return;
  }

  names.forEach((name) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "person-suggestion";

    button.textContent = name;

    button.addEventListener("click", () => {
      input.value = name;

      suggestionBox.innerHTML = "";

      suggestionBox.classList.remove("active");
    });

    suggestionBox.appendChild(button);
  });

  suggestionBox.classList.add("active");
}

/* =========================================================
   CAST LOOKUP
   ========================================================= */

function findPersonInCast(film, searchName) {
  const search = formatName(searchName);

  if (!search) {
    return false;
  }

  const castNames = getCastNames(film.cast);

  return castNames.some((name) => {
    const normalizedName = formatName(name);

    return (
      normalizedName === search ||
      normalizedName.includes(search) ||
      search.includes(normalizedName)
    );
  });
}

/* =========================================================
   COMMON FILMS
   ========================================================= */

function findCommonFilms() {
  if (!personOne || !personTwo || !commonFilmsResults) {
    return;
  }

  const nameOne = personOne.value.trim();

  const nameTwo = personTwo.value.trim();

  commonFilmsResults.innerHTML = "";

  if (!nameOne || !nameTwo) {
    commonFilmsResults.innerHTML = `

            <div class="common-films-empty">
                ENTER TWO NAMES
            </div>

        `;

    return;
  }

  const commonFilms = films.filter(
    (film) =>
      findPersonInCast(film, nameOne) && findPersonInCast(film, nameTwo),
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
    if (Number(a.year) !== Number(b.year)) {
      return Number(b.year) - Number(a.year);
    }

    return String(a.title || "").localeCompare(
      String(b.title || ""),
      undefined,
      {
        sensitivity: "base",
      },
    );
  });

  commonFilmsResults.innerHTML = commonFilms
    .map(
      (film) => `

                    <div
                        class="common-film-result"
                    >

                        <div
                            class="common-film-poster"
                        >

                            <img
                                src="${escapeHTML(film.poster || "")}"
                                alt="${escapeHTML(film.title || "")}"
                            >

                        </div>


                        <div
                            class="common-film-info"
                        >

                            <div
                                class="common-film-year"
                            >
                                ${escapeHTML(film.year || "")}
                            </div>


                            <div
                                class="common-film-title"
                            >
                                ${escapeHTML(film.title || "")}
                            </div>


                            <div
                                class="common-film-people"
                            >

                                <span
                                    class="common-film-person"
                                >
                                    ${escapeHTML(nameOne)}
                                </span>


                                <span
                                    class="common-film-person"
                                >
                                    ${escapeHTML(nameTwo)}
                                </span>

                            </div>

                        </div>

                    </div>

                `,
    )
    .join("");
}

/* =========================================================
   FILMOGRAPHY SUGGESTIONS
   ========================================================= */

function showFilmographySuggestions() {
  if (!filmographyPerson || !filmographySuggestions) {
    return;
  }

  const query = formatName(filmographyPerson.value);

  filmographySuggestions.innerHTML = "";

  if (query.length < 2) {
    filmographySuggestions.classList.remove("active");

    return;
  }

  const matches = new Map();

  films.forEach((film) => {
    const castNames = getCastNames(film.cast);

    castNames.forEach((name) => {
      const normalized = formatName(name);

      if (normalized.includes(query) && !matches.has(normalized)) {
        matches.set(normalized, name);
      }
    });
  });

  const names = Array.from(matches.values())
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
      }),
    )
    .slice(0, 10);

  if (names.length === 0) {
    filmographySuggestions.classList.remove("active");

    return;
  }

  names.forEach((name) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "person-suggestion";

    button.textContent = name;

    button.addEventListener("click", () => {
      filmographyPerson.value = name;

      filmographySuggestions.innerHTML = "";

      filmographySuggestions.classList.remove("active");

      findFilmography();
    });

    filmographySuggestions.appendChild(button);
  });

  filmographySuggestions.classList.add("active");
}

/* =========================================================
   FIND FILMOGRAPHY
   ========================================================= */

function findFilmography() {
  if (!filmographyPerson || !filmographyResults) {
    return;
  }

  const searchName = filmographyPerson.value.trim();

  filmographyResults.innerHTML = "";

  if (!searchName) {
    filmographyResults.innerHTML = `

            <div class="common-films-empty">
                ENTER A NAME
            </div>

        `;

    return;
  }

  const matchingFilms = films.filter((film) =>
    findPersonInCast(film, searchName),
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
    if (Number(a.year) !== Number(b.year)) {
      return Number(b.year) - Number(a.year);
    }

    return String(a.title || "").localeCompare(
      String(b.title || ""),
      undefined,
      {
        sensitivity: "base",
      },
    );
  });

  filmographyResults.innerHTML = `

        <div
            class="filmography-count"
        >
            ${matchingFilms.length}
            FILM${matchingFilms.length === 1 ? "" : "S"}
            FOUND
        </div>

    `;

  matchingFilms.forEach((film) => {
    const castNames = getCastNames(film.cast);

    const matchedCastName = castNames.find((name) =>
      findPersonInCast(
        {
          cast: [name],
        },
        searchName,
      ),
    );

    const result = document.createElement("div");

    result.className = "filmography-result";

    result.innerHTML = `

                <div
                    class="filmography-poster"
                >

                    <img
                        src="${escapeHTML(film.poster || "")}"
                        alt="${escapeHTML(film.title || "")}"
                    >

                </div>


                <div
                    class="filmography-info"
                >

                    <div
                        class="filmography-year"
                    >
                        ${escapeHTML(film.year || "")}
                    </div>


                    <div
                        class="filmography-title"
                    >
                        ${escapeHTML(film.title || "")}
                    </div>


                    ${
                      matchedCastName
                        ? `

                                <span
                                    class="filmography-role"
                                >
                                    ${escapeHTML(matchedCastName)}
                                </span>

                            `
                        : ""
                    }

                </div>

            `;

    /*
     * Clicking a filmography result
     * can also open the full film details.
     */

    result.addEventListener("click", () => {
      closeFilmography();

      openFilmDetails(film);
    });

    result.style.cursor = "pointer";

    filmographyResults.appendChild(result);
  });
}

/* =========================================================
   CAST RANKING
   ========================================================= */

function buildCastRanking() {
  if (!castRanking) {
    return;
  }

  const castCounts = new Map();

  films.forEach((film) => {
    const castNames = getCastNames(film.cast);

    const countedInFilm = new Set();

    castNames.forEach((name) => {
      const normalized = formatName(name);

      if (!normalized || countedInFilm.has(normalized)) {
        return;
      }

      countedInFilm.add(normalized);

      if (!castCounts.has(normalized)) {
        castCounts.set(normalized, {
          name,
          count: 0,
        });
      }

      castCounts.get(normalized).count++;
    });
  });

  const rankings = Array.from(castCounts.values())
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
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

  castRanking.innerHTML = rankings
    .map(
      (person, index) => `

                    <div
                        class="cast-ranking-card"
                        data-person="${escapeHTML(person.name)}"
                    >

                        <div
                            class="cast-rank"
                        >
                            ${String(index + 1).padStart(2, "0")}
                        </div>


                        <div
                            class="cast-name"
                        >
                            ${escapeHTML(person.name)}
                        </div>


                        <div
                            class="cast-film-count"
                        >
                            ${person.count}
                            FILM${person.count === 1 ? "" : "S"}
                        </div>

                    </div>

                `,
    )
    .join("");

  castRanking.querySelectorAll(".cast-ranking-card").forEach((card) => {
    card.addEventListener("click", () => {
      const person = card.dataset.person;

      openFilmography(person);
    });
  });
}

/* =========================================================
   DIRECTOR RANKING
   Shows ALL directors with more than 1 film.
   ========================================================= */

function buildDirectorsRanking() {
  if (!directorsRanking) {
    return;
  }

  const directorCounts = new Map();

  films.forEach((film) => {
    const directors = getDirectorNames(film.director);

    const countedInFilm = new Set();

    directors.forEach((name) => {
      const normalized = formatName(name);

      if (!normalized || countedInFilm.has(normalized)) {
        return;
      }

      countedInFilm.add(normalized);

      if (!directorCounts.has(normalized)) {
        directorCounts.set(normalized, {
          name,
          count: 0,
        });
      }

      directorCounts.get(normalized).count++;
    });
  });

  /*
   * ALL DIRECTORS WITH MORE THAN
   * ONE CINEMALAYA FILM.
   */

  const rankings = Array.from(directorCounts.values())
    .filter((director) => director.count > 1)
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });

  if (rankings.length === 0) {
    directorsRanking.innerHTML = `

            <div class="empty-films">
                NO DIRECTOR WITH MORE THAN ONE FILM FOUND
            </div>

        `;

    return;
  }

  directorsRanking.innerHTML = rankings
    .map(
      (director, index) => `

                    <div
                        class="cast-ranking-card"
                        data-director="${escapeHTML(director.name)}"
                    >

                        <div
                            class="cast-rank"
                        >
                            ${String(index + 1).padStart(2, "0")}
                        </div>


                        <div
                            class="cast-name"
                        >
                            ${escapeHTML(director.name)}
                        </div>


                        <div
                            class="cast-film-count"
                        >
                            ${director.count}
                            FILM${director.count === 1 ? "" : "S"}
                        </div>

                    </div>

                `,
    )
    .join("");

    directorsRanking
    .querySelectorAll(
        ".cast-ranking-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const director =
                        card.dataset.director;

                    openDirectorFilmography(
                        director
                    );

                }
            );

        }
    );
}

/* =========================================================
   DIRECTOR FILMOGRAPHY
   ========================================================= */

function findDirectorFilms(searchName) {
  const search = formatName(searchName);

  if (!search) {
    return [];
  }

  return films.filter((film) => {
    const directors = getDirectorNames(film.director);

    return directors.some((director) => {
      const normalized = formatName(director);

      return (
        normalized === search ||
        normalized.includes(search) ||
        search.includes(normalized)
      );
    });
  });
}

/* =========================================================
   OPEN DIRECTOR FILMOGRAPHY
   ========================================================= */

function openDirectorFilmography(director) {

    if (
        !filmographyModal ||
        !filmographyResults
    ) {
        return;
    }

    filmographyModal.classList.add(
        "active"
    );

    if (filmographyPerson) {
        filmographyPerson.value =
            director;
    }

    if (filmographySuggestions) {
        filmographySuggestions.innerHTML =
            "";

        filmographySuggestions.classList.remove(
            "active"
        );
    }

    /*
     * Find all films directed by this person
     */
    const matchingFilms =
        findDirectorFilms(
            director
        );

    filmographyResults.innerHTML =
        "";

    if (
        matchingFilms.length ===
        0
    ) {

        filmographyResults.innerHTML = `
            <div class="common-films-empty">
                NO FILMS FOUND
            </div>
        `;

        return;
    }

    /*
     * Newest first,
     * then alphabetical.
     */
    matchingFilms.sort(
        (a, b) => {

            if (
                Number(a.year) !==
                Number(b.year)
            ) {

                return (
                    Number(b.year) -
                    Number(a.year)
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

    /*
     * Film count
     */
    filmographyResults.innerHTML = `
        <div class="filmography-count">
            ${matchingFilms.length}
            FILM${matchingFilms.length === 1 ? "" : "S"}
            DIRECTED
        </div>
    `;

    /*
     * Create results
     */
    matchingFilms.forEach(
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
                            film.poster || ""
                        )}"
                        alt="${escapeHTML(
                            film.title || ""
                        )}"
                    >

                </div>

                <div
                    class="filmography-info"
                >

                    <div
                        class="filmography-year"
                    >
                        ${escapeHTML(
                            film.year || ""
                        )}
                    </div>

                    <div
                        class="filmography-title"
                    >
                        ${escapeHTML(
                            film.title || ""
                        )}
                    </div>

                    <span
                        class="filmography-role"
                    >
                        DIRECTOR
                    </span>

                </div>

            `;

            /*
             * Clicking a film opens
             * the full film details.
             */
            result.addEventListener(
                "click",
                () => {

                    closeFilmography();

                    openFilmDetails(
                        film
                    );

                }
            );

            result.style.cursor =
                "pointer";

            filmographyResults.appendChild(
                result
            );

        }
    );
}

/* =========================================================
   OPEN FILMOGRAPHY
   ========================================================= */

function openFilmography(person) {
  if (!filmographyModal || !filmographyPerson) {
    return;
  }

  filmographyModal.classList.add("active");

  filmographyPerson.value = person;

  if (filmographySuggestions) {
    filmographySuggestions.innerHTML = "";

    filmographySuggestions.classList.remove("active");
  }

  findFilmography();
}

/* =========================================================
   HOME
   ========================================================= */

function showHome() {
  if (castSection) {
    castSection.classList.remove("active");
  }

  if (directorsSection) {
    directorsSection.classList.remove("active");
  }

  if (filmsGrid) {
    filmsGrid.style.display = "";
  }

  if (pagination) {
    pagination.style.display = "";
  }

  if (filmControls) {
    filmControls.style.display = "";
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

  setActiveButton(homeButton);

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
}

/* =========================================================
   SHOW CAST
   ========================================================= */

function showCast() {
  hideFilmList();

  if (castSection) {
    castSection.classList.add("active");
  }

  if (directorsSection) {
    directorsSection.classList.remove("active");
  }

  setActiveButton(castButton);

  buildCastRanking();

  if (castSection) {
    castSection.scrollIntoView({
      behavior: "smooth",

      block: "start",
    });
  }
}

/* =========================================================
   SHOW DIRECTORS
   ========================================================= */

function showDirectors() {
  hideFilmList();

  if (directorsSection) {
    directorsSection.classList.add("active");
  }

  if (castSection) {
    castSection.classList.remove("active");
  }

  setActiveButton(directorsButton);

  buildDirectorsRanking();

  if (directorsSection) {
    directorsSection.scrollIntoView({
      behavior: "smooth",

      block: "start",
    });
  }
}

/* =========================================================
   HIDE FILM LIST
   ========================================================= */

function hideFilmList() {
  if (filmsGrid) {
    filmsGrid.style.display = "none";
  }

  if (pagination) {
    pagination.style.display = "none";
  }

  if (filmControls) {
    filmControls.style.display = "none";
  }
}

/* =========================================================
   ACTIVE NAV BUTTON
   ========================================================= */

function setActiveButton(activeButton) {
  document
    .querySelectorAll(".archive-button")
    .forEach((button) => button.classList.remove("active"));

  if (activeButton) {
    activeButton.classList.add("active");
  }
}

/* =========================================================
   CLOSE FILMOGRAPHY
   ========================================================= */

function closeFilmography() {
  if (filmographyModal) {
    filmographyModal.classList.remove("active");
  }
}

/* =========================================================
   CLOSE COMMON FILMS
   ========================================================= */

function closeCommonFilms() {
  if (commonFilmsModal) {
    commonFilmsModal.classList.remove("active");
  }
}

/* =========================================================
   THEME
   ========================================================= */

function updateThemeLabel() {
  if (!themeLabel) {
    return;
  }

  const dark = document.documentElement.classList.contains("dark-mode");

  themeLabel.textContent = dark ? "DARK" : "LIGHT";
}

/* =========================================================
   SET THEME
   ========================================================= */

function setTheme(dark) {
  if (dark) {
    document.documentElement.classList.add("dark-mode");

    localStorage.setItem("cinemalaya-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark-mode");

    localStorage.setItem("cinemalaya-theme", "light");
  }

  updateThemeLabel();
}

/* =========================================================
   LOAD SAVED THEME
   ========================================================= */

function loadTheme() {
  const savedTheme = localStorage.getItem("cinemalaya-theme");

  if (savedTheme === "dark") {
    setTheme(true);

    return;
  }

  if (savedTheme === "light") {
    setTheme(false);

    return;
  }

  /*
   * Use system preference
   * when no saved preference exists.
   */

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  setTheme(prefersDark);
}

/* =========================================================
   YEAR FILTER
   ========================================================= */

if (yearFilter) {
  yearFilter.addEventListener("change", () => {
    currentPage = 1;

    if (castSection) {
      castSection.classList.remove("active");
    }

    if (directorsSection) {
      directorsSection.classList.remove("active");
    }

    if (filmsGrid) {
      filmsGrid.style.display = "";
    }

    if (pagination) {
      pagination.style.display = "";
    }

    if (filmControls) {
      filmControls.style.display = "";
    }

    setActiveButton(homeButton);

    renderFilms();
  });
}

/* =========================================================
   WATCH FILTER
   ========================================================= */

if (watchFilter) {
  watchFilter.addEventListener("change", () => {
    currentPage = 1;

    if (castSection) {
      castSection.classList.remove("active");
    }

    if (directorsSection) {
      directorsSection.classList.remove("active");
    }

    if (filmsGrid) {
      filmsGrid.style.display = "";
    }

    if (pagination) {
      pagination.style.display = "";
    }

    if (filmControls) {
      filmControls.style.display = "";
    }

    setActiveButton(homeButton);

    renderFilms();
  });
}

/* =========================================================
   SEARCH
   ========================================================= */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;

    if (castSection) {
      castSection.classList.remove("active");
    }

    if (directorsSection) {
      directorsSection.classList.remove("active");
    }

    if (filmsGrid) {
      filmsGrid.style.display = "";
    }

    if (pagination) {
      pagination.style.display = "";
    }

    if (filmControls) {
      filmControls.style.display = "";
    }

    setActiveButton(homeButton);

    renderFilms();
  });
}

/* =========================================================
   HOME BUTTON
   ========================================================= */

if (homeButton) {
  homeButton.addEventListener("click", showHome);
}

/* =========================================================
   CAST BUTTON
   ========================================================= */

if (castButton) {
  castButton.addEventListener("click", showCast);
}

/* =========================================================
   DIRECTORS BUTTON
   ========================================================= */

if (directorsButton) {
  directorsButton.addEventListener("click", showDirectors);
}

/* =========================================================
   DEVELOPER MODAL
   ========================================================= */

if (developerModal && developerClose) {
  developerClose.addEventListener("click", () => {
    developerModal.style.display = "none";
  });

  developerModal.addEventListener("click", (event) => {
    if (event.target === developerModal) {
      developerModal.style.display = "none";
    }
  });
}

/* =========================================================
   COMMON FILMS OPEN
   ========================================================= */

if (findPeopleButton && commonFilmsModal) {
  findPeopleButton.addEventListener("click", () => {
    commonFilmsModal.classList.add("active");

    if (commonFilmsResults) {
      commonFilmsResults.innerHTML = "";
    }

    if (personOne) {
      personOne.value = "";
    }

    if (personTwo) {
      personTwo.value = "";
    }

    if (personOneSuggestions) {
      personOneSuggestions.innerHTML = "";

      personOneSuggestions.classList.remove("active");
    }

    if (personTwoSuggestions) {
      personTwoSuggestions.innerHTML = "";

      personTwoSuggestions.classList.remove("active");
    }

    if (personOne) {
      personOne.focus();
    }
  });
}

/* =========================================================
   COMMON FILMS CLOSE
   ========================================================= */

if (commonFilmsClose) {
  commonFilmsClose.addEventListener("click", closeCommonFilms);
}

/* =========================================================
   COMMON FILMS BACKDROP
   ========================================================= */

if (commonFilmsModal) {
  commonFilmsModal.addEventListener("click", (event) => {
    if (event.target === commonFilmsModal) {
      closeCommonFilms();
    }
  });
}

/* =========================================================
   COMMON FILMS INPUT 1
   ========================================================= */

if (personOne && personOneSuggestions) {
  personOne.addEventListener("input", () => {
    showPersonSuggestions(personOne, personOneSuggestions);
  });
}

/* =========================================================
   COMMON FILMS INPUT 2
   ========================================================= */

if (personTwo && personTwoSuggestions) {
  personTwo.addEventListener("input", () => {
    showPersonSuggestions(personTwo, personTwoSuggestions);
  });
}

/* =========================================================
   COMMON FILMS BUTTON
   ========================================================= */

if (findCommonFilmsButton) {
  findCommonFilmsButton.addEventListener("click", findCommonFilms);
}

/* =========================================================
   COMMON FILMS ENTER
   ========================================================= */

if (personOne) {
  personOne.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      findCommonFilms();
    }
  });
}

if (personTwo) {
  personTwo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      findCommonFilms();
    }
  });
}

/* =========================================================
   FILMOGRAPHY OPEN
   ========================================================= */

if (filmographyButton && filmographyModal) {
  filmographyButton.addEventListener("click", () => {
    filmographyModal.classList.add("active");

    if (filmographyPerson) {
      filmographyPerson.value = "";
    }

    if (filmographySuggestions) {
      filmographySuggestions.innerHTML = "";

      filmographySuggestions.classList.remove("active");
    }

    if (filmographyResults) {
      filmographyResults.innerHTML = "";
    }

    if (filmographyPerson) {
      filmographyPerson.focus();
    }
  });
}

/* =========================================================
   FILMOGRAPHY CLOSE
   ========================================================= */

if (filmographyClose) {
  filmographyClose.addEventListener("click", closeFilmography);
}

/* =========================================================
   FILMOGRAPHY BACKDROP
   ========================================================= */

if (filmographyModal) {
  filmographyModal.addEventListener("click", (event) => {
    if (event.target === filmographyModal) {
      closeFilmography();
    }
  });
}

/* =========================================================
   FILMOGRAPHY INPUT
   ========================================================= */

if (filmographyPerson && filmographySuggestions) {
  filmographyPerson.addEventListener("input", showFilmographySuggestions);
}

/* =========================================================
   FILMOGRAPHY BUTTON
   ========================================================= */

if (findFilmographyButton) {
  findFilmographyButton.addEventListener("click", findFilmography);
}

/* =========================================================
   FILMOGRAPHY ENTER
   ========================================================= */

if (filmographyPerson) {
  filmographyPerson.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      findFilmography();
    }
  });
}

/* =========================================================
   FILM DETAILS CLOSE
   ========================================================= */

if (filmDetailsClose) {
  filmDetailsClose.addEventListener("click", closeFilmDetails);
}

/* =========================================================
   FILM DETAILS BACKDROP
   ========================================================= */

if (filmDetailsModal) {
  filmDetailsModal.addEventListener("click", (event) => {
    if (event.target === filmDetailsModal) {
      closeFilmDetails();
    }
  });
}

/* =========================================================
   GLOBAL ESCAPE KEY
   ========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (filmDetailsModal && filmDetailsModal.classList.contains("active")) {
    closeFilmDetails();

    return;
  }

  if (commonFilmsModal && commonFilmsModal.classList.contains("active")) {
    closeCommonFilms();

    return;
  }

  if (filmographyModal && filmographyModal.classList.contains("active")) {
    closeFilmography();

    return;
  }
});

/* =========================================================
   CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener("click", (event) => {
  if (
    personOne &&
    personOneSuggestions &&
    !personOne.contains(event.target) &&
    !personOneSuggestions.contains(event.target)
  ) {
    personOneSuggestions.classList.remove("active");
  }

  if (
    personTwo &&
    personTwoSuggestions &&
    !personTwo.contains(event.target) &&
    !personTwoSuggestions.contains(event.target)
  ) {
    personTwoSuggestions.classList.remove("active");
  }

  if (
    filmographyPerson &&
    filmographySuggestions &&
    !filmographyPerson.contains(event.target) &&
    !filmographySuggestions.contains(event.target)
  ) {
    filmographySuggestions.classList.remove("active");
  }
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark-mode");

    setTheme(!isDark);
  });
}

loadTheme();
loadFilms();
