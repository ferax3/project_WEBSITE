import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaGrip, FaHeart, FaDiceFive} from "react-icons/fa6";
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';
import Axios from 'axios';
import './Favourites.css';
import { useParams, useNavigate } from 'react-router-dom';

const Favourites = () => {
  const { userID } = useParams();
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [cityID, setCityID] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    Axios.get(`http://localhost:3002/user/${userID}`).then((res) => {
        const cityID = res.data.cityID;
        setCityID(cityID);
        fetchFavourites(userID, cityID);
    });
    Axios.get('http://localhost:3002/cities')
        .then((res) => {
            setCities(res.data);
    });
    }, [userID]);
    const handleCityChange = (e) => {
        const newCityID = parseInt(e.target.value);
        setCityID(newCityID);
    
        Axios.put(`http://localhost:3002/user/${userID}/city`, { cityID: newCityID })
            .then(() => {
            console.log('Місто оновлено');
            fetchFavourites(userID, newCityID);
            })
            .catch((err) => {
            console.error('Помилка при оновленні міста', err);
            });
    };

    const filteredPlaces = places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = selectedTag === '' || (place.tags || []).includes(selectedTag);
        return matchesSearch && matchesTag;
    });
    
const fetchFavourites = (userID: string, cityID: number) => {
  Axios.get(`http://localhost:3002/all-favourites/${userID}?cityID=${cityID}`)
    .then((res) => {
      setPlaces(res.data);
      const allTags = new Set();
      res.data.forEach(p => {
        (p.tags || []).forEach(tag => allTags.add(tag));
      });
      setTags([...allTags]);
    })
    .catch((err) => {
      console.error('Error fetching favourites:', err);
    });
};


    return (
        <div className="favourites-page">
            <div className="blob-outer-container">
                <div className="blob-inner-container">
                    <div className="blob"></div>
                </div>
            </div>

            <div className="parent">
                <div className='header'>
                    <div className="div1 item">
                        <div className="search-wrapper z-index-2">
                            <label htmlFor="search">Пошук:&nbsp;</label>
                                <input
                                id="search"
                                type="text"
                                placeholder="місце..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            <label htmlFor="tag-filter" style={{ marginLeft: '12px' }}>
                                <select
                                    id="tag-filter"
                                    className="tag-select"
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                >
                                    <option value="">Усі теги</option>
                                    {tags.map((tag, idx) => (
                                        <option key={idx} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>  
                    <div className="div2 item"> 
                        <div className='z-index-2 city-select-wrapper'>
                            <label htmlFor="city-select">Регіон:&nbsp;</label>
                            {cityID !== null && (
                            <select id="city-select" value={cityID} onChange={handleCityChange}>
                                {cities.map(city => (
                                <option key={city.cityID} value={city.cityID}>
                                    {city.name}
                                </option>
                                ))}
                            </select>
                            )}
                        </div> 
                    </div>
                </div>

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
                        <div
                            className="circle-button"
                            onClick={() => {
                                Axios.get(`http://localhost:3002/random-place/${userID}`)
                                .then((res) => {
                                    const placeID = res.data.placeID;
                                    navigate(`/place/${userID}/${placeID}`);
                                })
                                .catch((err) => {
                                    console.error('Не вдалося отримати випадкове місце', err);
                                    alert('У цьому місті поки що немає місць.');
                                });
                            }}
                            >
                            <FaDiceFive />
                        </div>
                        <Link to="/">
                            <div className="circle-button red"><FaSignOutAlt /></div>
                        </Link>  
                    </div>
                </div>

                {filteredPlaces.length === 0 && (
                    <h1 className="no-favourites-message">
                        У вас немає вподобаних місць у цьому місті
                    </h1>
                )}
                <div className="places-grid">

                {filteredPlaces.map((place) => (
                    <Link to={`/place/${userID}/${place.placeID}`} className="place-link">
                        <div className="item places-card" key={place.placeID}>
                            <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} className="place-image" />
                            <div className="z-index-2">
                                <h3>{place.name}</h3>
                                {place.description && (
                                    <p>{place.description.split('-----')[0].trim()}</p>
                                )}

                                {place.tags && place.tags.length > 0 && (
                                    <div className="tags">
                                        {place.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    );
};

export default Favourites;