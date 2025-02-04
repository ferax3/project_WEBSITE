import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react';
import Axios from 'axios';
import "../../App.css"
const Dashboard = () => {
  const location = useLocation();
  const { userID } = useParams();
  const name = location.state?.name || 'User';


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
    <div className='dashboard flex'>
      <div className="dashboardContainer flex">
        <Link to="/">
          <button>Log Out</button>
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
        </div>
      </div>
    </div>

      {/* <div className='dashboard flex'>
        <div className="dashboardContainer flex">
          <Link to="/">
            <button>Log Out</button>
          </Link>        
          <div>
            <h1>Welcome to your Dashboard, {name}!</h1>
            <p>Your ID: {userID}</p>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default Dashboard