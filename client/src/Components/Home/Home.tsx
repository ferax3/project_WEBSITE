import './Home.css'
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { FaGrip, FaHeart, FaDiceFive} from "react-icons/fa6";

import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Axios from 'axios';

const Home = () => {
    const { userID } = useParams();
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [cityID, setCityID] = useState(null);
    const [cities, setCities] = useState([]);
    const [topPlaces, setTopPlaces] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [newPlaces, setNewPlaces] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [tags, setTags] = useState([]);
    const [taggedRecommendations, setTaggedRecommendations] = useState([]);
    const [noRecommendationMessage, setNoRecommendationMessage] = useState('');


    useEffect(() => {
        Axios.get(`http://localhost:3002/user/${userID}`)
            .then((response) => {
            if (response.data) {
                setUserName(response.data.name);
                setCityID(Number(response.data.cityID));
                fetchTopPlaces(userID);
                fetchUserStats();                
                fetchNewPlaces();
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
        Axios.get('http://localhost:3002/tags')
            .then(res => setTags(res.data))
            .catch(err => console.error('Error fetching tags:', err));
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
            fetchNewPlaces();
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
            if (Array.isArray(res.data)) {
                setRecommendations(res.data);
                setNoRecommendationMessage('');
                //!ADD
                const places = res.data;
                const placeIDs = places.map(p => p.placeID);
                Axios.get(`http://localhost:3002/place-tags?ids=${placeIDs.join(',')}`)
                    .then(tagRes => {
                        const tagMap = tagRes.data; // { placeID: [теги] }
                        const enriched = places.map(p => ({
                            ...p,
                            tags: tagMap[p.placeID] || []
                        }));
                        setTaggedRecommendations(enriched);
                    });
            } else if (res.data.message) {
                setRecommendations([]);
                // alert(res.data.message);
                setNoRecommendationMessage(res.data.message);
            }
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
    const fetchNewPlaces = () => {
        Axios.get(`http://localhost:3002/new-places/${userID}`)
          .then(res => {
          setNewPlaces(res.data);
        })
        .catch((err) => {
            console.error('Error fetching new places:', err);
        });
    };


    //! зміна, аби показувало всі рекомендації замість того, аби показувало тільки тих, які більше за 3
    // const filteredRecommendations = selectedTag
    // ? taggedRecommendations.filter(
    //     place => place.tags?.includes(selectedTag) && place.predictedRating > 3
    // )
    // : [];
    const filteredRecommendations = selectedTag
    ? taggedRecommendations.filter(
        place => place.tags?.includes(selectedTag)
    )
    : [];
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
                <div className=" item rounded-left div3"> 
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
                                    console.error('Не вдалося отримати випадкову пам\'ятку', err);
                                    alert('У цьому регіоні поки що немає місць.');
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
                <div className="div4 item"> 
                    <div className="z-index-2">
                        <h2>Рекомендовані пам'ятки за&nbsp;
                            <select id="tag-select" value={selectedTag} onChange={e => setSelectedTag(e.target.value)}>
                                <option disabled value="">тегом</option>
                                {tags.map(tag => (
                                <option key={tag.tagID} value={tag.name}>
                                    {tag.name}
                                </option>
                                ))}
                            </select>
                            </h2>
                            <ul>
                            {selectedTag ? (
                                filteredRecommendations.length > 0 ? (
                                    filteredRecommendations.slice(0, 5).map(place => (
                                        <ul>
                                            <Link to={`/place/${userID}/${place.placeID}`}>
                                                {place.name}
                                            </Link>
                                        </ul>
                                    ))
                                ) : (
                                    <li>Немає пам'яток за обраним тегом</li>
                                )
                            ) : (
                                <li>Оберіть тег, щоб побачити пам'ятку</li>
                            )}
                            </ul>
                    </div>
                </div>
                <div className="div5 item">
                    <div className='z-index-2'>
                        <h2>Вподобані пам'ятки</h2>
                        <ul>
                        {favourites.length > 0 ? (
                            favourites.map((place) => (
                            <li key={place.placeID}>
                                <Link to={`/place/${userID}/${place.placeID}`}>
                                    {place.name}
                                </Link>
                            </li>
                            ))
                        ) : (
                            <li>Немає вподобаних пам'яток</li>
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
                                    <Link to={`/place/${userID}/${place.placeID}`}>
                                        {place.name}
                                    </Link> — {place.predictedRating}
                                </li>
                            ))
                        ) : noRecommendationMessage ? (
                            <p className='no-recommendation-message'>
                                    {noRecommendationMessage}
                                    {/* <p>Оцініть принаймні 5 місць, щоб ми могли підібрати найкращі рекомендації саме для вас!</p> */}
                                    <br />
                                    <Link to={`/catalog/${userID}`} className="go-to-catalog">
                                        Перейти до Каталогу
                                    </Link>
                            </p>
                        ) : (
                            <li>Немає рекомендацій</li>
                        )}
                    </div> 
                </div>
                <div className="div7 item"> 
                    <div className='z-index-2'>
                        <h2>Нові пам'ятки</h2>
                        {newPlaces.length > 0 ? (
                            newPlaces.map(place => (
                            <li key={place.placeID}>
                                <Link to={`/place/${userID}/${place.placeID}`}>
                                    {place.name}
                                </Link>
                            </li>
                            ))
                        ) : (
                            <li>Немає нових пам'яток</li>
                        )}
                    </div> 
                </div>
                <div className="div8 item"> 
                    <div className='z-index-2'>
                        <h2>Топ-пам'яток регіону</h2>
                        <ul>
                        {topPlaces.map(place => (
                            <li key={place.placeID}>
                                <Link to={`/place/${userID}/${place.placeID}`}>
                                    {place.name}
                                </Link> – {place.avgRating}
                            </li>
                        ))}
                        </ul>
                    </div> 
                </div>
                <div className="div9 item">
                    <div className='z-index-2'>
                        <h2>Ваша статистика</h2>
                        <p>
                            Ви вже відвідали {userStats?.visitedCount || 0} об'єктів <br />
                            Середній рейтинг ваших пам'яток – {userStats?.avgRating || 0} <br />
                            Відсоток відвіданих пам'яток – {userStats?.visitedPercent || 0}%
                        </p>
                    </div> 
                </div>
            </div>
        </div>
    );
};

export default Home;