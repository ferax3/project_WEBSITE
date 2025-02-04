import { Link, useLocation, useParams } from 'react-router-dom'
import "../../App.css"
const Dashboard = () => {
  const location = useLocation();
  const { userID } = useParams();
  const name = location.state?.name || 'User';
  return (
    <>
      <div className='dashboard flex'>
        <div className="dashboardContainer flex">
          <Link to="/">
            <button>Log Out</button>
          </Link>
        </div>
        <div>
          <h1>Welcome to your Dashboard, {name}!</h1>
          <p>Your ID: {userID}</p>
        </div>
      </div>


    </>
  )
}

export default Dashboard