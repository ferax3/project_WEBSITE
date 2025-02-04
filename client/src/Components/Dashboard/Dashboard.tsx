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
    {/* <div className='dashboard flex'> */}
      {/* <div className="dashboardContainer flex"> */}
      <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to your Dashboard <br/> {name}</h1>
        <p>Your ID: {userID}</p>
        <Link to={`/places/${userID}`}>
          <button className="places-button">View All Places</button>
        </Link>
        <Link to="/">
          <button className="places-button">Log Out</button>
        </Link>  
      </div>

      <h2>Recommended Places:</h2>
      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div className="recommendation-card" key={rec.placeID}>
            <div className="rating-badge">{index + 1}</div>

            <h3>{rec.name}</h3>
            <p>Predicted Rating: {rec.predictedRating}</p>

            {rec.predictedRating >= 3.5 && (
              <div className="thumbs-up-icon">
                <FaThumbsUp size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
        {/* <Link to="/">
          <button>Log Out</button>
        </Link>  

        <Link to={`/places/${userID}`}>
          <button>View All Places</button>
        </Link>       
        <div>
          <h1>Welcome to your Dashboard, {name}!</h1>
          <p>Your ID: {userID}</p>

          <h2>Recommended Places:</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Place Name</th>
                <th>Predicted Rating</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec, index) => (
                <tr key={rec.placeID}>
                  <td>{index + 1}</td>
                  <td>{rec.name}</td>
                  <td>{rec.predictedRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
      {/* </div> */}
    {/* </div> */}
    </>
  );
}

export default Dashboard