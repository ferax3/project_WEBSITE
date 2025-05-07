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

  useEffect(() => {
    Axios.get(`http://localhost:3002/user/${userID}`).then((res) => {
        const cityID = res.data.cityID;
        setCityID(cityID);

        Axios.get(`http://localhost:3002/places/by-city/${cityID}`).then((res) => {
            setPlaces(res.data);
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

      })
      .catch((err) => {
        console.error('Помилка при оновленні міста', err);
      });
};

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                            placeholder="Пошук місця..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            />

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
                    <div className="circle-button red"><FaSignOutAlt /></div>
                </div>
            </div>
            <div className="places-grid">
            {filteredPlaces.map((place) => (
                <div className="item places-card" key={place.placeID}>
                    <img src={`http://localhost:3002${place.imagePath}`} alt={place.name} className="place-image" />
                <div className="z-index-2">
                    <h3>{place.name}</h3>
                    <p>{place.description || 'Опис відсутній'}</p>
                </div>
                </div>
            ))}
            </div>

            {/* <div className="places-card">
                {filteredPlaces.map((place) => (
                <div className="item" key={place.placeID}>
                    <div className="z-index-2">
                        <h3>{place.name}</h3>
                        <p>{place.description || 'Опис відсутній'}</p>
                    </div>
                </div>
                ))}
            </div> */}
            {/* {filteredPlaces.map((place, index) => (
                <div className={`item`} style={{ gridArea: getGridArea(index) }} key={place.placeID}>
                    <div className="z-index-2">
                    <h3>{place.name}</h3>
                    <p>{place.description || 'Опис відсутній'}</p>
                    </div>
                </div>
            ))} */}
        </div>
    </div>
  );
};

export default Catalog;
