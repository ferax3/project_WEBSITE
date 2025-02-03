import { Link, useLocation, useParams } from 'react-router-dom'
import "../../App.css"
const Dashboard = () => {
  const location = useLocation();
  const { id } = useParams();
  const username = location.state?.username || 'User';
  return (
    <>
      <div className='dashboard flex'>
        <div className="dashboardContainer flex">
          <Link to="/">
            <button>Log Out</button>
          </Link>
        </div>
        <div>
          <h1>Welcome to your Dashboard, {username}!</h1>
          <p>Your ID: {id}</p>
        </div>
      </div>


    </>
  )
}

export default Dashboard