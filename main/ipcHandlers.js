const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { HiAnime } = require("aniwatch");

const aniwatch = new HiAnime.Scraper();
const dataDir = path.join(__dirname, "..", "data");

function readJSON(file) {
    try {
        return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    } catch {
        return {};
    }
}

ipcMain.handle("get-homepage", async () => {
    try {
        const homeData = await aniwatch.getHomePage();

        return {
            topAiringAnimes: homeData?.topAiringAnimes || [],
            mostPopularAnimes: homeData?.mostPopularAnimes || [],
            latestEpisodeAnimes: homeData?.latestEpisodeAnimes || [],
        };
    } catch (err) {
        console.error(err);
        return {
            topAiringAnimes: [],
            mostPopularAnimes: [],
            latestEpisodeAnimes: [],
        };
    }
});

ipcMain.handle("search-anime", async (event, { query, page }) => {
    try {
        console.log("Search query:", query, "Page:", page);
        // Make sure query is a non-empty string
        if (!query || typeof query !== "string" || query.trim() === "") {
            return {
                "nigga u dumb": "ik",
                'idk gng': "lol",
            };
        }

        const results = await aniwatch.search(query.trim(), page || 1);

        return {
            animes: results.animes || [],
            currentPage: results.currentPage || 1,
            totalPages: results.totalPages || 1,
            hasNextPage: results.hasNextPage || false,
        };
    } catch (err) {
        console.error(err);
        return {
            animes: [],
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
        };
    }
});

ipcMain.handle("get-anime-details", async (event, animeId) => {
    try {
        const details = await aniwatch.getInfo(animeId);
        console.log("Anime details:", details);
        return details;
    } catch (err) {
        console.error(err);
        return null;
    }
});

ipcMain.handle("get-anime-episodes", async (event, animeId) => {
    try {
        const episodes = await aniwatch.getEpisodes(animeId);
        console.log("Anime episodes:", episodes);
        return episodes;
    } catch (err) {
        console.error(err);
        return null;
    }
});

// Local JSON data
ipcMain.handle("get-user-data", () => readJSON("user.json"));
ipcMain.handle("get-progress", () => readJSON("progress.json"));
