import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/search.css";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!query || !window.electronAPI) return;

        setLoading(true);

        window.electronAPI
            .invoke("search-anime", { query, page })
            .then((data) => {
                console.log("Raw search data:", data);
                setResults(Array.isArray(data.animes) ? data.animes : []);
                setHasNextPage(data.hasNextPage);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setResults([]);
                setLoading(false);
            });
    }, [query, page]);

    const renderCards = (items) => {
        if (!Array.isArray(items) || items.length === 0) return <p>No results to display.</p>;

        return items.map((anime) => (
            <div key={anime.id} className="card">
                <img src={anime.poster} alt={anime.name} />
                <h3>{anime.name.length > 18 ? anime.name.slice(0, 18) + "..." : anime.name}</h3>
                {anime.moreInfo && (
                    <p>
                        {anime.moreInfo[1]} | {anime.moreInfo[2]} <br />
                        {anime.moreInfo[0]}
                    </p>
                )}
            </div>
        ));
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        console.log("Current results length:", results);
        if (results.length > 0) setPage(page + 1);
    };

    return (
        <div className="search-container">
            <h2>Search Results for "{query}"</h2>
            {loading ? (
                <p>Loading...</p>
            ) : results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <>
                    <div className="cards-container">{renderCards(results)}</div>
                    <div className="pagination">
                        <button onClick={handlePrevPage} disabled={page === 1}>
                            ← Previous
                        </button>
                        <span>Page {page}</span>
                        <button onClick={handleNextPage} disabled={hasNextPage === false}>
                            Next →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
