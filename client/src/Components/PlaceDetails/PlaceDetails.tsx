import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import './PlaceDetails.css';


import { FaUser, FaSignOutAlt, FaStar } from 'react-icons/fa';
import { FaGrip, FaHeart, FaDiceFive} from "react-icons/fa6";

const PlaceDetails = () => {
    const { userID, placeID } = useParams();
    const [place, setPlace] = useState(null);
    const [cityName, setCityName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [comments, setComments] = useState([]);
    const [similarPlaces, setSimilarPlaces] = useState([]);
    const [isFavourite, setIsFavourite] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        Axios.get(`http://localhost:3002/place/${placeID}`)
            .then((res) => {
                setPlace(res.data);
                if (res.data.cityID) {
                    Axios.get(`http://localhost:3002/cities`)
                        .then((citiesRes) => {
                            const city = citiesRes.data.find(c => c.cityID === res.data.cityID);
                            if (city) setCityName(city.name);
                        });
                }
            })
            .catch((err) => console.error('Error fetching place:', err));

        Axios.get(`http://localhost:3002/place-tags?ids=${placeID}`)
            .then((res) => {
                setTags(res.data[placeID] || []);
            })
            .catch((err) => console.error('Error fetching tags:', err));
        Axios.get(`http://localhost:3002/feedbacks/comments/${placeID}`)
            .then(res => setComments(res.data))
            .catch(err => console.error('Error fetching comments:', err));
        if (placeID) {
            Axios.get(`http://localhost:3002/similar-places/${placeID}`)
                .then(res => setSimilarPlaces(res.data))
                .catch(err => console.error('Error fetching similar places:', err));
        }
        Axios.get(`http://localhost:3002/favourites/${userID}`)
            .then((res) => {
                const liked = res.data.some(fav => fav.placeID === parseInt(placeID));
                setIsFavourite(liked);
            });
        if (userID && placeID) {
            Axios.get(`http://localhost:3002/rating`, {
                params: {
                    userID,
                    placeID
                }
            })
            .then((res) => {
                setSelectedRating(res.data.rating);
            })
            .catch((err) => console.error('Помилка при отриманні рейтингу:', err));
        }
        Axios.get(`http://localhost:3002/comments/${placeID}`)
            .then((res) => setFeedbacks(res.data))
            .catch((err) => console.error('Error fetching comments:', err));

    }, [userID, placeID]);

    if (!place) return <p>Завантаження...</p>;

    const [shortDesc, detailedDesc] = place.description?.split('-----').map(p => p.trim()) || [];

    const handleSendComment = () => {
        if (!commentText.trim()) return;

        Axios.post('http://localhost:3002/comment', {
            userID,
            placeID,
            comment: commentText
        }).then(() => {
            setFeedbacks(prev => [
                { comment: commentText, reviewDate: new Date().toISOString().split('T')[0], userName: 'Ви' },
                ...prev
            ]);
            setCommentText('');
        }).catch((err) => {
            console.error('Помилка при надсиланні коментаря:', err);
        });
    };
    const toggleFavourite = () => {
        if (isFavourite) {
            Axios.delete(`http://localhost:3002/favourites/${userID}/${placeID}`).then(() => {
                setIsFavourite(false);
            });
        } else {
            Axios.post(`http://localhost:3002/favourites`, {
                userID,
                placeID
            }).then(() => {
                setIsFavourite(true);
            });
        }
    };
    const handleRating = (rating: number) => {
        setSelectedRating(rating);
        Axios.post('http://localhost:3002/rate', {
            userID: userID,
            placeID: placeID,
            rating: rating
        })
        .then(res => {
            console.log('Рейтинг збережено:', res.data.message);
        })
        .catch(err => {
            console.error('Помилка при збереженні рейтингу:', err);
        });
    };
    return (
        <div className="details-page">
            <div className="blob-outer-container">
                <div className="blob-inner-container">
                    <div className="blob"></div>
                </div>
            </div>

            <div className="place-details">
                <div className="item div3">
                    <div className='z-index-2'>
                        <Link to={`/home/${userID}`}>
                            <div className="circle-button"><FaUser /></div>
                        </Link>
                        <Link to={`/catalog/${userID}`}>
                            <div className="circle-button"><FaGrip /></div>
                        </Link>
                        <Link to={`/favourites/${userID}`}>
                            <div className="circle-button"><FaHeart /></div>
                        </Link>
                        <div className="circle-button"><FaDiceFive /></div>
                        <Link to="/">
                            <div className="circle-button red"><FaSignOutAlt /></div>
                        </Link>  
                    </div>
                </div>
                <div className="top-part">
                    <div className="image">
                        <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} className="detail-image" />
                    </div>

                    <div className="info">
                        <div className="header">
                            {cityName && <p className="city">Місто: {cityName}</p>}
                        </div>
                        <div className="card-info">
                            <div className="favourite-icon" onClick={toggleFavourite}>
                                <FaHeart style={{ color: isFavourite ? 'red' : 'gray', cursor: 'pointer' }} />
                            </div>
                            <h1>{place.name}</h1>
                            {shortDesc && <p className="short">{shortDesc}</p>}
                            <div className="tags-mark">
                                {tags.length > 0 && (
                                    <div className="tags">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                <div className='rating'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                        key={star}
                                        className="star"
                                        size={24}
                                        color={(hoveredRating || selectedRating) >= star ? "#FFD700" : "#ccc"}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => handleRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>
                            {place.address && <p className="address"><strong>Адреса:</strong> {place.address}</p>}
                        </div>
                    </div>
                </div>
                <div className="deep-info">
                    <h3>Детальний опис</h3>
                    {detailedDesc && <p className="detailed">{detailedDesc}</p>}
                    <div className="comments-section">
                        <h3>Коментарі</h3>
                        {selectedRating > 0 && (
                            <div className="add-comment">
                                <textarea
                                    placeholder="Залиште свій коментар..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button onClick={handleSendComment}>Надіслати</button>
                            </div>
                        )}
                        {comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <div key={index} className="comment">
                                    <p><strong>{comment.userName}</strong> ({new Date(comment.reviewDate).toLocaleDateString()}):</p>
                                    <p>{comment.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p>Коментарів немає</p>
                        )}
                    </div>
                    {similarPlaces.length > 0 && (
                        <div className="similar-places-section">
                            <div className="section-title">Схожі місця за тегами</div>
                            <div className="carousel">
                            {similarPlaces.map((place) => (
                                <Link
                                to={`/place/${userID}/${place.placeID}`}
                                className="similar-card"
                                key={place.placeID}
                                >
                                <div className="image">
                                    <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} />
                                </div>
                                <div className="content">
                                    <h3>{place.name}</h3>
                                    <p>
                                    {(place.description?.split('-----')[0] || '').trim() || 'Опис відсутній'}
                                    </p>
                                </div>
                                </Link>
                            ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PlaceDetails;