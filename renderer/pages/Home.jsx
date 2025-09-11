import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
    const [homeData, setHomeData] = useState({
        topAiring: [],
        mostPopular: [],
        latestEpisode: [],
    });
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.invoke("get-homepage").then((data) => {
            console.log("Homepage data:", data); // check this
            setHomeData({
                topAiring: data.topAiringAnimes || [],
                mostPopular: data.mostPopularAnimes || [],
                latestEpisode: data.latestEpisodeAnimes || [],
            });
        }).catch(console.error);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    };

    const renderCards = (items) => {
        console.log("Rendering cards:", items);
        return items.map((anime) => (
            <div key={anime.id} className="card">
                <img src={anime.poster} alt={anime.name} />
                <h3>{anime.name.length > 18 ? anime.name.slice(0, 15) + "..." : anime.name}</h3>
                {anime.rank && <p>Rank: {anime.rank}</p>}
                <p>
                    {anime.episodes?.sub && `Sub: ${anime.episodes.sub}`}
                    {anime.episodes?.sub && anime.episodes?.dub && " | "}
                    {anime.episodes?.dub && `Dub: ${anime.episodes.dub}`}
                </p>
            </div>
        ));
    };

    return (
        <div className="home-container">
            {/* Search Bar */}
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for an anime..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {/* Homepage Sections: only three horizontal rows */}
            {homeData.topAiring.length > 0 && (
                <section>
                    <h2>Top Airing</h2>
                    <div className="cards-container">{renderCards(homeData.topAiring)}</div>
                </section>
            )}

            {homeData.mostPopular.length > 0 && (
                <section>
                    <h2>Most Popular</h2>
                    <div className="cards-container">{renderCards(homeData.mostPopular)}</div>
                </section>
            )}

            {homeData.latestEpisode.length > 0 && (
                <section>
                    <h2>Latest Episodes</h2>
                    <div className="cards-container">{renderCards(homeData.latestEpisode)}</div>
                </section>
            )}
        </div>
    );
}
