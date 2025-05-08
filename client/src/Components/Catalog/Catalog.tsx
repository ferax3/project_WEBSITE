import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaGrip, FaHeart, FaDiceFive} from "react-icons/fa6";
import { Link } from 'react-router-dom';

import { useEffect, useState } from 'react';
import Axios from 'axios';
import './Catalog.css'; // використай ті самі стилі
import { useParams } from 'react-router-dom';

const Catalog = () => {
  const { userID } = useParams();
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
        fetchPlacesByCity(cityID);

        Axios.get(`http://localhost:3002/places/by-city/${cityID}`)
        .then((res) => {
            setPlaces(res.data);
            // зібрати всі унікальні теги
            const allTags = new Set();
            res.data.forEach(p => {
                (p.tags || []).forEach(tag => allTags.add(tag));
            });
            setTags([...allTags]);
        });
    });
    Axios.get('http://localhost:3002/cities')
    .then((res) => {
    setCities(res.data);
    });
    }, [userID]);
    const handleCityChange = (e) => {
        const newCityID = parseInt(e.target.value);
        setCityID(newCityID);
    
        Axios.put(`http://localhost:3002/user/${userID}/city`, {
        cityID: newCityID
        })
        .then((res) => {
            console.log('Місто оновлено');
            fetchPlacesByCity(newCityID);

        })
        .catch((err) => {
            console.error('Помилка при оновленні міста', err);
        });
    };

    // const filteredPlaces = places.filter(place =>
    //     place.name.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    const filteredPlaces = places.filter(place => {
        const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = selectedTag === '' || (place.tags || []).includes(selectedTag);
        return matchesSearch && matchesTag;
    });
      
    const fetchPlacesByCity = (cityID) => {
        Axios.get(`http://localhost:3002/places/by-city/${cityID}`)
        .then((res) => {
            setPlaces(res.data);
        })
        .catch((err) => {
            console.error('Error fetching places:', err);
        });
    };

    return (
        <div className="catalog-page">
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
                                {/* <FaGrip />&nbsp; */}
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
                            <label htmlFor="city-select">Місто:&nbsp;</label>
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
                        <div className="circle-button"><FaHeart /></div>
                        <div className="circle-button"><FaDiceFive /></div>
                        <Link to="/">
                            <div className="circle-button red"><FaSignOutAlt /></div>
                        </Link>  
                    </div>
                </div>

                <div className="places-grid">
                {filteredPlaces.map((place) => (
                    <div className="item places-card" key={place.placeID}>
                        <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} className="place-image" />
                        <div className="z-index-2">
                            <h3>{place.name}</h3>
                            <p>{place.description || 'Опис відсутній'}</p>
                            {place.tags && place.tags.length > 0 && (
                                <div className="tags">
                                    {place.tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
};

export default Catalog;
