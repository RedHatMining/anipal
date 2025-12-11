import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/mediaPage.css';

export default function MediaPage() {
    const { animeID } = useParams();
    const navigate = useNavigate();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        if (!animeID) return;

        const fetchAnimeDetails = async () => {
            try {
                setLoading(true);
                const [detailsData, episodesData] = await Promise.all([
                    window.electronAPI.invoke('get-anime-details', animeID),
                    window.electronAPI.invoke('get-anime-episodes', animeID)
                ]);
                console.log("Fetched anime details:", detailsData);
                console.log("Fetched episodes:", episodesData);
                setAnimeDetails(detailsData);
                setEpisodes(episodesData?.episodes || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimeDetails();
    }, [animeID]);

    if (loading) return <div className="media-page loading">Loading...</div>;
    if (error) return <div className="media-page error">Error: {error}</div>;
    if (!animeDetails?.anime) return <div className="media-page">No anime found</div>;

    const { anime, recommendedAnimes = [], relatedAnimes = [], seasons = [] } = animeDetails;
    const info = anime.info;
    const moreInfo = anime.moreInfo;

    const handleAnimeClick = (animeId) => {
        navigate(`/mediapage/${animeId}`);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderAnimeCard = (anime) => (
        <div key={anime.id} className="card" onClick={() => handleAnimeClick(anime.id)} style={{ cursor: "pointer" }}>
            <img src={anime.poster} alt={anime.name} loading="lazy" />
            <h4>{anime.name}</h4>
            <p>{anime.type}</p>
        </div>
    );

    return (
        <div className="media-page">
            <div className="media-layout">
            {/* Episodes Sidebar */}
            {episodes && episodes.length > 0 && (
                <div className="episodes-sidebar">
                    <h3>Episodes</h3>
                    <div className="episodes-list">
                        {episodes.map((episode, idx) => (
                            <div key={idx} className="episode-item">
                                <span className="episode-number">{episode.number || idx + 1}</span>
                                <span className="episode-title">{episode.title || `Episode ${episode.number || idx + 1}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="media-main-content">
            {/* Header Section */}
            <div className="media-header">
                <img src={info.poster} alt={info.name} className="media-poster" />
                <div className="media-info">
                    <h1>{info.name}</h1>
                    {info.jname && <h2 className="alt-title">{info.jname}</h2>}
                    
                    <p className="description">{info.description}</p>
                    
                    <div className="meta-info">
                        {info.stats?.rating && <span className="rating">Rating: {info.stats.rating}</span>}
                        {info.stats?.type && <span className="type">{info.stats.type}</span>}
                        {moreInfo?.status && <span className="status">{moreInfo.status}</span>}
                        {info.stats?.quality && <span className="quality">{info.stats.quality}</span>}
                    </div>

                    {moreInfo?.aired && <p><strong>Aired:</strong> {moreInfo.aired}</p>}

                    {info.stats?.episodes && (
                        <p className="episodes">
                            <strong>Episodes:</strong> {info.stats.episodes.sub || info.stats.episodes.dub}
                            {info.stats.episodes.sub && ` (Sub: ${info.stats.episodes.sub})`}
                            {info.stats.episodes.dub && ` / Dub: ${info.stats.episodes.dub}`}
                        </p>
                    )}

                    {info.stats?.duration && <p><strong>Duration:</strong> {info.stats.duration}</p>}
                    {moreInfo?.studios && <p><strong>Studios:</strong> {moreInfo.studios}</p>}
                </div>
            </div>

            {/* Genres Section */}
            {moreInfo?.genres && moreInfo.genres.length > 0 && (
                <div className="genres">
                    <h3>Genres</h3>
                    <div className="genre-list">
                        {moreInfo.genres.map((genre, idx) => (
                            <span key={idx} className="genre-tag">{genre}</span>
                        ))}
                    </div>
                </div>
            )}



            {/* Seasons Dropdown */}
            {seasons && seasons.length > 0 && (
                <div className="dropdown-section">
                    <div className="dropdown-header" onClick={() => toggleSection('seasons')}>
                        <h3>Seasons</h3>
                        <span className={`dropdown-arrow ${expandedSections.seasons ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.seasons && (
                        <div className="dropdown-content">
                            <div className="seasons-list">
                                {seasons.map((season) => (
                                    <div 
                                        key={season.id} 
                                        className={`season-item ${season.isCurrent ? 'current' : ''}`}
                                        onClick={() => handleAnimeClick(season.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <img src={season.poster} alt={season.title} loading="lazy" />
                                        <p>{season.title}</p>
                                        {season.isCurrent && <span className="current-badge">Current</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Related Animes Dropdown */}
            {relatedAnimes && relatedAnimes.length > 0 && (
                <div className="dropdown-section">
                    <div className="dropdown-header" onClick={() => toggleSection('related')}>
                        <h3>Related</h3>
                        <span className={`dropdown-arrow ${expandedSections.related ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.related && (
                        <div className="dropdown-content">
                            <div className="related-list">
                                {relatedAnimes.map(renderAnimeCard)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommended Animes Dropdown */}
            {recommendedAnimes && recommendedAnimes.length > 0 && (
                <div className="dropdown-section">
                    <div className="dropdown-header" onClick={() => toggleSection('recommended')}>
                        <h3>Recommended</h3>
                        <span className={`dropdown-arrow ${expandedSections.recommended ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.recommended && (
                        <div className="dropdown-content">
                            <div className="recommended-list">
                                {recommendedAnimes.map(renderAnimeCard)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            </div>
            </div>

        </div>
    );
}