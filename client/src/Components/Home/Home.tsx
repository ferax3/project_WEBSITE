import './Home.css'
import { FaUser, FaPlus, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Axios from 'axios';

const Home = () => {
    const { userID } = useParams();
    const [userName, setUserName] = useState('');
    const [cityID, setCityID] = useState(null);
    const [cities, setCities] = useState([]);
    const [topPlaces, setTopPlaces] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [favourites, setFavourites] = useState([]);

    useEffect(() => {
        Axios.get(`http://localhost:3002/user/${userID}`)
            .then((response) => {
            if (response.data) {
                setUserName(response.data.name);
                setCityID(Number(response.data.cityID));
                fetchTopPlaces(userID);
                fetchUserStats();
                fetchRecommendations();
                fetchFavourites();
            }
            })
            .catch((error) => {
            console.error('Error fetching user:', error);
        });
        Axios.get('http://localhost:3002/cities')
            .then((res) => {
            setCities(res.data);
        });
        Axios.get(`http://localhost:3002/top-places/${userID}`)
            .then((res) => {
                setTopPlaces(res.data);
        })
        .catch((err) => {
            console.error('Error fetching top places:', err);
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
            fetchTopPlaces(userID);
            fetchUserStats();
            fetchRecommendations();
            fetchFavourites();
          })
          .catch((err) => {
            console.error('Помилка при оновленні міста', err);
          });
    };
    const fetchTopPlaces = (id) => {
        Axios.get(`http://localhost:3002/top-places/${id}`)
          .then((res) => {
            setTopPlaces(res.data);
          })
          .catch((err) => {
            console.error('Error fetching top places:', err);
          });
    };
    const fetchUserStats = () => {
        Axios.get(`http://localhost:3002/user-stats/${userID}`)
          .then((res) => {
            setUserStats(res.data);
          })
          .catch((err) => {
            console.error('Error fetching user stats:', err);
          });
    };
    const fetchRecommendations = () => {
        Axios.get(`http://localhost:3002/recommendations/${userID}`)
          .then((res) => {
            setRecommendations(res.data);
          })
          .catch((err) => {
            console.error('Error fetching recommendations:', err);
          });
    };
    const fetchFavourites = () => {
        Axios.get(`http://localhost:3002/favourites/${userID}`)
          .then((res) => {
            setFavourites(res.data);
          })
          .catch((err) => {
            console.error('Error fetching favourites:', err);
          });
    };
      
        
    return (
        <div className='main-page'>

            <div className="blob-outer-container">
                <div className="blob-inner-container">
                    <div className="blob"></div>
                </div>
            </div>

            <div className="parent">
                <div className="div1 item"> 
                    <div className='z-index-2'>
                        <h2>Вітаємо, {userName}</h2>

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
                <div className=" item rounded-left div3"> 
                    <div className='z-index-2'>
                        меню
                        <div className="circle-button"><FaUser /></div>
                        <div className="circle-button"><FaPlus /></div>
                        <div className="circle-button"><FaEdit /></div>
                        <div className="circle-button"><FaSignOutAlt /></div>
                    </div>
                </div>
                <div className="div4 item"> 
                    <div className="z-index-2">
                        <h2>Рекомендовані місця за тегом</h2>
                        <ul>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                        </ul>
                    </div>
                </div>
                <div className="div5 item">
                    <div className='z-index-2'>
                        <h2>Обрані місця</h2>
                        <ul>
                        {favourites.length > 0 ? (
                            favourites.map((place) => (
                            <li key={place.placeID}>
                                {place.name}
                            </li>
                            ))
                        ) : (
                            <li>Немає обраних місць</li>
                        )}
                        </ul>
                    </div> 
                </div>
                <div className="div6 item">
                    <div className='z-index-2'>
                        <h2>Рекомендація</h2>
                        {recommendations.length > 0 ? (
                            recommendations.slice(0, 5).map((place) => (
                            <li key={place.placeID}>
                                {place.name} — ⭐ {place.predictedRating}
                            </li>
                            ))
                        ) : (
                            <li>Немає рекомендацій</li>
                        )}
                    </div> 
                </div>
                <div className="div7 item"> 
                    <div className='z-index-2'>
                        <h2>Нові місця</h2>
                        <ul>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                            <li>Місце</li>
                        </ul>
                    </div> 
                </div>
                <div className="div8 item"> 
                    <div className='z-index-2'>
                        <h2>Топ-місця міста</h2>
                        <ul>
                        {topPlaces.map(place => (
                            <li key={place.placeID}>
                            {place.name} – ⭐ {place.avgRating}
                            </li>
                        ))}
                        </ul>
                    </div> 
                </div>
                <div className="div9 item">
                    <div className='z-index-2'>
                        <h2>Ваша статистика</h2>
                        <p>
                            Ви вже відвідали {userStats?.visitedCount || 0} місць <br />
                            Середній рейтинг ваших місць – {userStats?.avgRating || 0} <br />
                            Відсоток відвіданих місць – {userStats?.visitedPercent || 0}%
                        </p>
                    </div> 
                </div>
            </div>
        </div>
    );
};

export default Home;