import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';

import Axios from 'axios';
import "../../App.css"
import "./Dashboard.css";
const Dashboard = () => {
  const location = useLocation();
  const { userID } = useParams();
  const name = location.state?.name || '';

  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (userID) {
      Axios.get(`http://localhost:3002/recommendations/${userID}`)
        .then((response) => {
          setRecommendations(response.data);
        })
        .catch((error) => {
          console.error('Error fetching recommendations:', error);
        });
    }
  }, [userID]);
  return (
    <>
    <div className="dashboard">
      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Вітаємо, {name}</h1>
          {/* <p>Your ID: {userID}</p> */}
          <div className="buttons">
            <Link to={`/places/${userID}`}>
              <button className="places-button green">Каталог</button>
            </Link>
            <Link to="/">
              <button className="places-button red">Вийти</button>
            </Link>  
          </div>
        </div>
        <h2>Рекомендація для відвідання місць:</h2>
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div className="recommendation-card" key={rec.placeID}>
              <div className="rating-badge">{index + 1}</div>

              <h3>{rec.name}</h3>
              <p>Прогнозована оцінка: {rec.predictedRating}</p>
              <p className="description">{rec.description}</p>
              {rec.predictedRating >= 3.5 && (
                <div className="thumbs-up-icon">
                  <FaThumbsUp size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

export default Dashboard