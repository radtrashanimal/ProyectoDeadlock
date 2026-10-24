const characters = [
    {
        id: "001",
        name: "Rem",
        role: "Support",
        description: "A quick-witted ally who keeps the team on its feet.",
        lore: "Never the loudest person in the room, Rem is often the one who notices what everyone else missed. They stay close to their crew, looking for the opening that turns a rough fight around. When the pressure rises, Rem's quick thinking and steady presence give allies room to make their next move.",
        image: "Resources/Rem_Alt.png",
        tone: "rem"
    },
    {
        id: "002",
        name: "Dynamo",
        role: "Support",
        description: "A cosmic tactician who brings the team together.",
        lore: "Dynamo sees a fight as a shifting pattern: every step, feint, and missed shot changes what comes next. He studies the chaos and finds a way to turn it into an advantage for the whole crew. Where others see a scattered battle, Dynamo sees the moment his team can move as one.",
        image: "Resources/Dynamo.png",
        tone: "dynamo"
    },
    {
        id: "003",
        name: "Seven",
        role: "Carry",
        description: "A storm-powered fighter who brings thunder to every battle.",
        lore: "Seven carries the force of a storm into every confrontation. He doesn't wait for the perfect moment to act; he makes the other side react to him. Once the fight breaks open, Seven presses forward with overwhelming force and leaves little room for anyone to catch their breath.",
        image: "Resources/Seven.png",
        tone: "seven"
    },
    {
        id: "004",
        name: "Ivy",
        role: "Support",
        description: "A nimble guardian who looks out for her crew.",
        lore: "Ivy is happiest above the street, where rooftops and fire escapes become paths of her own making. She keeps a watchful eye on the people she calls family, moving fast whenever they need help. Her loyalty is unwavering, and she never leaves a friend behind.",
        image: "Resources/Ivy.png",
        tone: "ivy"
    },
    {
        id: "005",
        name: "Salomon",
        role: "Front Line",
        description: "A steadfast bruiser who holds the line.",
        lore: "Salomon knows that standing your ground can be the hardest move of all. He steps between danger and his crew, making space for them to regroup and strike back. Calm under pressure, he turns a crowded street into a line his opponents have to work to cross.",
        image: "Resources/Solomon_Render.png",
        tone: "salomon"
    },
    {
        id: "006",
        name: "Lash",
        role: "Carry",
        description: "An aggressive fighter who thrives in the middle of the action.",
        lore: "Lash lives for the moment a fight becomes personal. He taunts, leaps into the fray, and dares opponents to keep up with him. Beneath the swagger is a fighter who knows exactly how to disrupt the other side and keep their attention where he wants it.",
        image: "Resources/Lash.png",
        tone: "lash"
    }
];

const rosterGrid = document.querySelector("#roster-grid");
const heroCount = document.querySelector("#hero-count");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#hero-search");
const searchMessage = document.querySelector("#search-message");
const clearSearchButton = document.querySelector("#clear-search");
const createForm = document.querySelector("#create-form");
const createMessage = document.querySelector("#create-message");
const heroDialog = document.querySelector("#hero-dialog");
const closeDialogButton = document.querySelector("#dialog-close");
const detailPortrait = document.querySelector("#detail-portrait");
const detailPlaceholder = document.querySelector("#detail-placeholder");
const detailImage = document.querySelector("#detail-image");
const detailId = document.querySelector("#detail-id");
const detailName = document.querySelector("#detail-name");
const detailRole = document.querySelector("#detail-role");
const detailLore = document.querySelector("#detail-lore");
const favoriteMessage = document.querySelector("#favorite-message");
const favoriteCount = document.querySelector("#favorite-count");
const emptyFavorites = document.querySelector("#empty-favorites");
const isFavoritesPage = document.body.dataset.page === "favorites";
const favoritesStorageKey = "deadlock-favorite-heroes";
const customCharactersStorageKey = "deadlock-custom-heroes";
let favoriteIds = new Set();

try {
    const savedCharacters = localStorage.getItem(customCharactersStorageKey);
    if (savedCharacters) {
        const parsedCharacters = JSON.parse(savedCharacters);
        const validRoles = ["Carry", "Front Line", "Support"];
        const isValidCharacter = (character) => character
            && typeof character === "object"
            && typeof character.id === "string"
            && /^\d{3,}$/.test(character.id)
            && typeof character.name === "string"
            && character.name.length > 0
            && character.name.length <= 32
            && validRoles.includes(character.role)
            && typeof character.description === "string"
            && character.description.length > 0
            && character.description.length <= 240
            && character.image === ""
            && character.tone === "custom";
        const savedIds = Array.isArray(parsedCharacters)
            ? parsedCharacters.map((character) => character && character.id)
            : [];
        const hasUniqueIds = new Set(savedIds).size === savedIds.length;

        if (Array.isArray(parsedCharacters)
            && parsedCharacters.every(isValidCharacter)
            && hasUniqueIds
            && parsedCharacters.every((character) => !characters.some((existing) => existing.id === character.id))) {
            characters.push(...parsedCharacters);
        } else {
            favoriteMessage.textContent = "Saved custom heroes could not be read. Create them again from the roster.";
            favoriteMessage.classList.add("is-error");
        }
    }
} catch (error) {
    favoriteMessage.textContent = "Custom heroes could not be loaded in this browser.";
    favoriteMessage.classList.add("is-error");
}

try {
    const savedFavorites = localStorage.getItem(favoritesStorageKey);
    if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites) && parsedFavorites.every((id) => typeof id === "string")) {
            favoriteIds = new Set(parsedFavorites.filter((id) => characters.some((character) => character.id === id)));
        } else {
            favoriteMessage.textContent = "Saved favorites could not be read. Add them again from the roster.";
            favoriteMessage.classList.add("is-error");
        }
    }
} catch (error) {
    favoriteMessage.textContent = "Favorites could not be loaded in this browser.";
    favoriteMessage.classList.add("is-error");
}

let nextCharacterId = characters.reduce((maxId, character) => {
    return Math.max(maxId, Number(character.id));
}, 0) + 1;

function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function createCharacterCard(character) {
    const card = makeElement("article", `hero-card hero-${character.tone}`);
    card.dataset.characterId = character.id;
    const openButton = makeElement("button", "hero-open-button");
    openButton.type = "button";
    openButton.setAttribute("aria-haspopup", "dialog");
    openButton.setAttribute("aria-label", `View ${character.name}, ${character.role}`);
    const portrait = makeElement("div", "portrait");
    const placeholder = makeElement("div", "portrait-placeholder", character.name.slice(0, 2).toUpperCase());
    placeholder.setAttribute("aria-hidden", "true");
    portrait.append(placeholder);

    if (character.image) {
        const image = makeElement("img", "portrait-image");
        image.src = character.image;
        image.alt = character.name;
        image.loading = "eager";
        image.addEventListener("load", () => {
            placeholder.hidden = true;
        }, { once: true });
        image.addEventListener("error", () => {
            image.remove();
        }, { once: true });
        portrait.append(image);
    }

    const id = makeElement("span", "hero-number", `ID ${character.id}`);
    const wash = makeElement("span", "portrait-wash");
    wash.setAttribute("aria-hidden", "true");
    portrait.append(id, wash);

    const info = makeElement("div", "hero-info");
    info.append(makeElement("h3", "", character.name));

    const role = makeElement("div", "hero-meta");
    role.append(makeElement("span", "role-dot"), makeElement("span", "", character.role.toUpperCase()));
    info.append(role);

    const description = makeElement("p", "hero-description", character.description);
    openButton.append(portrait, info, description);

    const isFavorite = favoriteIds.has(character.id);
    const favoriteButton = makeElement("button", `favorite-button${isFavorite ? " is-favorite" : ""}`, isFavorite ? "★" : "☆");
    favoriteButton.type = "button";
    favoriteButton.dataset.favoriteId = character.id;
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.setAttribute("aria-label", `${isFavorite ? "Remove" : "Add"} ${character.name} ${isFavorite ? "from" : "to"} favorites`);
    favoriteButton.title = `${isFavorite ? "Remove from" : "Add to"} favorites`;
    card.append(openButton, favoriteButton);
    return card;
}

function renderCharacters(list = characters) {
    rosterGrid.replaceChildren(...list.map(createCharacterCard));
    const count = isFavoritesPage ? list.length : characters.length;
    heroCount.textContent = String(count).padStart(2, "0");
    if (favoriteCount) {
        favoriteCount.textContent = String(favoriteIds.size).padStart(2, "0");
    }
    if (emptyFavorites) {
        emptyFavorites.hidden = list.length > 0;
    }
}

function openCharacterDetails(character, trigger) {
    detailId.textContent = `ID ${character.id}`;
    detailName.textContent = character.name;
    detailRole.textContent = character.role.toUpperCase();
    detailLore.textContent = character.lore || character.description;
    detailPlaceholder.textContent = character.name.slice(0, 2).toUpperCase();
    detailPortrait.className = `detail-portrait hero-${character.tone}`;
    detailImage.hidden = true;
    detailImage.removeAttribute("src");
    detailImage.alt = character.name;

    if (character.image) {
        detailImage.onload = () => {
            detailImage.hidden = false;
            detailPlaceholder.hidden = true;
        };
        detailImage.onerror = () => {
            detailImage.hidden = true;
            detailPlaceholder.hidden = false;
        };
        detailImage.src = character.image;
    } else {
        detailPlaceholder.hidden = false;
    }

    heroDialog.returnValue = "";
    heroDialog.showModal();
    closeDialogButton.focus();
    trigger.setAttribute("aria-expanded", "true");
    heroDialog.addEventListener("close", () => {
        trigger.removeAttribute("aria-expanded");
    }, { once: true });
}

rosterGrid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-button");
    if (favoriteButton) {
        const character = characters.find((item) => item.id === favoriteButton.dataset.favoriteId);
        if (character) {
            const updatedFavorites = new Set(favoriteIds);
            if (updatedFavorites.has(character.id)) {
                updatedFavorites.delete(character.id);
            } else {
                updatedFavorites.add(character.id);
            }

            try {
                localStorage.setItem(favoritesStorageKey, JSON.stringify([...updatedFavorites]));
                favoriteIds = updatedFavorites;
                favoriteMessage.textContent = `${character.name} ${favoriteIds.has(character.id) ? "added to" : "removed from"} favorites.`;
                favoriteMessage.classList.remove("is-error");
                if (isFavoritesPage) {
                    renderCharacters(characters.filter((item) => favoriteIds.has(item.id)));
                } else {
                    updateSearchResults();
                }
            } catch (error) {
                favoriteMessage.textContent = "Your favorite could not be saved. Check this browser's storage settings and try again.";
                favoriteMessage.classList.add("is-error");
            }
        }
        return;
    }

    const card = event.target.closest(".hero-card");
    if (!card || !event.target.closest(".hero-open-button")) {
        return;
    }

    const character = characters.find((item) => item.id === card.dataset.characterId);
    if (character) {
        openCharacterDetails(character, event.target.closest(".hero-open-button"));
    }
});

closeDialogButton.addEventListener("click", () => {
    heroDialog.close();
});

heroDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    heroDialog.close();
});

heroDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        event.preventDefault();
        heroDialog.close();
    }
});

heroDialog.addEventListener("click", (event) => {
    if (event.target === heroDialog) {
        heroDialog.close();
    }
});

function findCharacters(query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) {
        return characters;
    }

    return characters.filter((character) => {
        return character.name.toLocaleLowerCase().includes(normalizedQuery)
            || character.role.toLocaleLowerCase().includes(normalizedQuery)
            || character.id.toLocaleLowerCase().includes(normalizedQuery);
    });
}

function updateSearchResults() {
    if (isFavoritesPage) {
        const favorites = characters.filter((character) => favoriteIds.has(character.id));
        renderCharacters(favorites);
        return;
    }

    const query = searchInput.value.trim();
    const matches = findCharacters(query);
    renderCharacters(matches);

    if (matches.length === 0) {
        searchMessage.textContent = `No character found for "${query}". Try another name, ID, or role.`;
        return;
    }

    searchMessage.textContent = query
        ? `${matches.length} character${matches.length === 1 ? "" : "s"} found.`
        : `Showing all ${characters.length} characters.`;
}

if (searchForm && searchInput && clearSearchButton) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        updateSearchResults();
    });

    searchInput.addEventListener("input", updateSearchResults);

    clearSearchButton.addEventListener("click", () => {
        searchInput.value = "";
        updateSearchResults();
        searchInput.focus();
    });
}

if (createForm) createForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createMessage.textContent = "";
    createMessage.classList.remove("is-error", "is-success");

    const nameInput = createForm.elements.name;
    const roleInput = createForm.elements.role;
    const descriptionInput = createForm.elements.description;
    const name = nameInput.value.trim();
    const role = roleInput.value;
    const description = descriptionInput.value.trim();

    if (!name || !role || !description) {
        createMessage.textContent = "Please complete the name, role, and description before adding a character.";
        createMessage.classList.add("is-error");
        const firstMissingField = [nameInput, roleInput, descriptionInput].find((field) => !field.value.trim());
        firstMissingField.focus();
        return;
    }

    const character = {
        id: String(nextCharacterId).padStart(3, "0"),
        name,
        role,
        description,
        image: "",
        tone: "custom"
    };

    try {
        const customCharacters = characters.filter((item) => item.tone === "custom");
        localStorage.setItem(customCharactersStorageKey, JSON.stringify([...customCharacters, character]));
    } catch (error) {
        createMessage.textContent = "This character could not be saved. Check this browser's storage settings and try again.";
        createMessage.classList.add("is-error");
        return;
    }

    nextCharacterId += 1;
    characters.push(character);
    createForm.reset();
    searchInput.value = "";
    updateSearchResults();
    createMessage.textContent = `${character.name} was added to the roster with ID ${character.id}.`;
    createMessage.classList.add("is-success");
});

updateSearchResults();
