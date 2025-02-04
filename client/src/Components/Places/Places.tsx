import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Axios from 'axios';
import './Places.css';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const { userID } = useParams();

  useEffect(() => {
    // Завантаження всіх місць
    Axios.get('http://localhost:3002/places')
      .then((response) => {
        setPlaces(response.data);
      })
      .catch((error) => {
        console.error('Error fetching places:', error);
      });

    // Завантаження оцінок користувача
    Axios.get(`http://localhost:3002/user-feedbacks/${userID}`)
      .then((response) => {
        setUserFeedbacks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user feedbacks:', error);
      });
  }, [userID]);


    // Пошук оцінки для місця
const getUserRatingForPlace = (placeID) => {
    const feedback = userFeedbacks.find(fb => fb.placeID === placeID);
    return feedback ? `Оцінка: ${feedback.rating}/5` : ' ';
    };
    
  return (
    <div className="places-container">
        <h1>All Places</h1>

        {/* Кнопка для повернення на Dashboard */}
        <Link to={`/dashboard/${userID}`}>
            <button className="back-button">Back to Dashboard</button>
        </Link>

        <div className="places-grid">
            {places.map((place) => (
                <div className="place-card" key={place.placeID}>
                <h2>{place.name}</h2>
                <p>{place.description || 'No description available'}</p>
                <p className="address">{place.address || ' '}</p>
                <p className="rating">{getUserRatingForPlace(place.placeID)}</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Places;
