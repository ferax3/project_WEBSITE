import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import './PlaceDetails.css';

import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaGrip, FaHeart, FaDiceFive} from "react-icons/fa6";

const PlaceDetails = () => {
    const { userID, placeID } = useParams();
    const [place, setPlace] = useState(null);
    const [cityName, setCityName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [comments, setComments] = useState([]);

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
    }, [placeID]);

    if (!place) return <p>Завантаження...</p>;

    const [shortDesc, detailedDesc] = place.description?.split('-----').map(p => p.trim()) || [];
    
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
                        <div className="circle-button"><FaHeart /></div>
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
                                <p className='marks'>Оцінка</p>
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
                </div>
                {/* <h2>{place.name}</h2>
                {cityName && <p className="city"><strong>Місто:</strong> {cityName}</p>}
                <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} className="detail-image" />
                {shortDesc && <p className="short">{shortDesc}</p>}
                {detailedDesc && <p className="detailed">{detailedDesc}</p>}
                {place.address && <p className="address"><strong>Адреса:</strong> {place.address}</p>}
                {tags.length > 0 && (
                    <div className="tags">
                        <strong>Теги:</strong>&nbsp;
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default PlaceDetails;