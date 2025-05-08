import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import './PlaceDetails.css';

const PlaceDetails = () => {
    const { userID, placeID } = useParams();
    const [place, setPlace] = useState(null);
    const [cityName, setCityName] = useState('');
    const [tags, setTags] = useState<string[]>([]);

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
                            {shortDesc && <p className="short">{shortDesc}</p>}

                        </div>

                    </div>

                </div>
                <h2>{place.name}</h2>
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
                )}
            </div>
        </div>
    );
};

export default PlaceDetails;
