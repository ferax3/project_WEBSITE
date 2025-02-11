import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Axios from 'axios';
import './Places.css';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const { userID } = useParams();

  useEffect(() => {
    Axios.get('http://localhost:3002/places')
      .then((response) => {
        setPlaces(response.data);
      })
      .catch((error) => {
        console.error('Error fetching places:', error);
      });
    Axios.get(`http://localhost:3002/user-feedbacks/${userID}`)
      .then((response) => {
        setUserFeedbacks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user feedbacks:', error);
      });
  }, [userID]);

  const getUserRatingForPlace = (placeID) => {
    const feedback = userFeedbacks.find(fb => fb.placeID === placeID);
    return feedback ? feedback.rating : null;
  };

  const handleRatingChange = (placeID, newRating) => {
    Axios.post('http://localhost:3002/feedbacks', {
      userID,
      placeID,
      rating: newRating
    })
      .then(() => {
        setUserFeedbacks(prev =>
          prev.some(fb => fb.placeID === placeID)
            ? prev.map(fb => (fb.placeID === placeID ? { ...fb, rating: newRating } : fb))
            : [...prev, { placeID, rating: newRating }]
        );
      })
      .catch((error) => console.error('Error updating rating:', error));
  };

  return (
    <>

      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>
      <div className="allCatalog">
        <div className="places-container">
        <h1>Каталог</h1>
        <div className="buttons">
            <Link to={`/dashboard/${userID}`}>
              <button className="places-button green">Головна</button>
            </Link>
            <Link to="/">
              <button className="places-button red">Вийти</button>
            </Link>  
          </div>
        <div className="places-grid">
          {places.map((place) => {
            const userRating = getUserRatingForPlace(place.placeID);
            return (
              <div className="place-card" key={place.placeID}>
                <h2>{place.name}</h2>
                <p>{place.description || ''}</p>
                <p className="address">{place.address || ''}</p>

                <div className="rating-section">
                  <label>Оцінка:</label>
                  <select
                    value={userRating || ''}
                    onChange={(e) => handleRatingChange(place.placeID, parseInt(e.target.value))}
                  >
                    <option value="" disabled>{userRating ? 'Редагувати' : 'Оцінити'}</option>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>

                  {userRating && <p className="current-rating">Поточна оцінка: {userRating}/5</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
      
    </>
  );
};

export default Places;
