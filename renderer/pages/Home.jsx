import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/home.css";

// Constants
const MAX_TITLE_LENGTH = 18;
const TRUNCATE_AT = 15;

/**
 * AnimeCard component - Displays individual anime card
 */
const AnimeCard = ({ anime, onClick }) => {
  const truncatedName =
    anime.name.length > MAX_TITLE_LENGTH
      ? `${anime.name.slice(0, TRUNCATE_AT)}...`
      : anime.name;

  const episodeInfo = [
    anime.episodes?.sub && `Sub: ${anime.episodes.sub}`,
    anime.episodes?.dub && `Dub: ${anime.episodes.dub}`,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div
      className="card"
      onClick={onClick}
      onKeyPress={(e) => e.key === "Enter" && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${anime.name}`}
    >
      <img src={anime.poster} alt={anime.name} loading="lazy" />
      <h3>{truncatedName}</h3>
      {anime.rank && <p>Rank: {anime.rank}</p>}
      {episodeInfo && <p>{episodeInfo}</p>}
    </div>
  );
};

AnimeCard.propTypes = {
  anime: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    poster: PropTypes.string.isRequired,
    rank: PropTypes.number,
    episodes: PropTypes.shape({
      sub: PropTypes.number,
      dub: PropTypes.number,
    }),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * AnimeSection component - Displays a section of anime cards
 */
const AnimeSection = ({ title, items, onCardClick }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="anime-section" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      <div className="cards-container">
        {items.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            onClick={() => onCardClick(anime.id)}
          />
        ))}
      </div>
    </section>
  );
};

AnimeSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onCardClick: PropTypes.func.isRequired,
};

/**
 * Home component - Main homepage with search and anime sections
 */
export default function Home() {
  const [homeData, setHomeData] = useState({
    topAiring: [],
    mostPopular: [],
    latestEpisode: [],
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomepageData = async () => {
      if (!window.electronAPI) {
        setError("Electron API not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await window.electronAPI.invoke("get-homepage");
        
        setHomeData({
          topAiring: data.topAiringAnimes || [],
          mostPopular: data.mostPopularAnimes || [],
          latestEpisode: data.latestEpisodeAnimes || [],
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError("Failed to load anime data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) return;
    
    navigate(`/search/${encodeURIComponent(trimmedQuery)}`);
  };

  const handleCardClick = (animeId) => {
    navigate(`/mediapage/${animeId}`);
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading" role="status" aria-live="polite">
          Loading homepage...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch} role="search">
        <input
          id="anime-search"
          type="text"
          placeholder="Search for an anime..."
          value={query}
          onChange={handleQueryChange}
          aria-label="Search for anime"
        />
        <button type="submit" aria-label="Submit search">
          Search
        </button>
      </form>

      {/* Homepage Sections */}
      <AnimeSection
        title="Top Airing"
        items={homeData.topAiring}
        onCardClick={handleCardClick}
      />
      
      <AnimeSection
        title="Most Popular"
        items={homeData.mostPopular}
        onCardClick={handleCardClick}
      />
      
      <AnimeSection
        title="Latest Episodes"
        items={homeData.latestEpisode}
        onCardClick={handleCardClick}
      />
    </div>
  );
}