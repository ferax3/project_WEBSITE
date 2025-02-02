import { Link } from 'react-router-dom'
import "../../App.css"
const Dashboard = () => {
  return (
    <>
      <div className='dashboard flex'>
        <div className="dashboardContainer flex">
          <Link to="/">
            <button>Log Out</button>
          </Link>
        </div>
      </div>


    </>
  )
}

export default Dashboard