import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/search.css";

// Constants
const MAX_TITLE_LENGTH = 18;

/**
 * SearchResultCard component - Individual search result card
 */
const SearchResultCard = ({ anime, onClick }) => {
  const truncatedName =
    anime.name.length > MAX_TITLE_LENGTH
      ? `${anime.name.slice(0, MAX_TITLE_LENGTH)}...`
      : anime.name;

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
      {anime.moreInfo && anime.moreInfo.length >= 3 && (
        <p className="anime-info">
          {anime.moreInfo[1]} | {anime.moreInfo[2]}
          <br />
          {anime.moreInfo[0]}
        </p>
      )}
    </div>
  );
};

SearchResultCard.propTypes = {
  anime: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    poster: PropTypes.string.isRequired,
    moreInfo: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Pagination component - Page navigation controls
 */
const Pagination = ({ currentPage, hasNextPage, onPrevious, onNext }) => (
  <div className="pagination" role="navigation" aria-label="Search pagination">
    <button
      onClick={onPrevious}
      disabled={currentPage === 1}
      aria-label="Go to previous page"
    >
      ← Previous
    </button>
    <span aria-current="page">Page {currentPage}</span>
    <button
      onClick={onNext}
      disabled={!hasNextPage}
      aria-label="Go to next page"
    >
      Next →
    </button>
  </div>
);

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

/**
 * Search component - Main search results page
 */
export default function Search() {
  const { query } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const searchAnime = useCallback(async () => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (!window.electronAPI) {
      setError("Electron API not available");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await window.electronAPI.invoke("search-anime", {
        query,
        page,
      });

      setResults(Array.isArray(data.animes) ? data.animes : []);
      setHasNextPage(Boolean(data.hasNextPage));
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to load search results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    searchAnime();
  }, [searchAnime]);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const handleCardClick = useCallback(
    (animeId) => {
      navigate(`/mediapage/${animeId}`);
    },
    [navigate]
  );

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hasNextPage]);

  if (!query) {
    return (
      <div className="search-container">
        <p>Please enter a search query.</p>
      </div>
    );
  }

  return (
    <div className="search-container">
      <h2>
        Search Results for "<span className="query-text">{query}</span>"
      </h2>

      {loading && (
        <div className="loading" role="status" aria-live="polite">
          Loading results...
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="no-results">
          No results found for "{query}". Try a different search term.
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <div className="cards-container">
            {results.map((anime) => (
              <SearchResultCard
                key={anime.id}
                anime={anime}
                onClick={() => handleCardClick(anime.id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={page}
            hasNextPage={hasNextPage}
            onPrevious={handlePrevPage}
            onNext={handleNextPage}
          />
        </>
      )}
    </div>
  );
}