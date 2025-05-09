import Dashboard from './Components/Dashboard/Dashboard'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Places from './Components/Places/Places';
import Home from './Components/Home/Home';
import Catalog from './Components/Catalog/Catalog';
import PlaceDetails from './Components/PlaceDetails/PlaceDetails';
import Favourites from './Components/Favourites/Favourites';

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'

import './App.css'


const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard/:userID", element: <Dashboard /> },
  { path: "/places/:userID", element: <Places /> },
  { path: "/home/:userID", element: <Home />},
  { path: "/home/:userID", element: <Home />},
  { path: "/catalog/:userID", element: <Catalog /> },
  { path: "/place/:userID/:placeID", element: <PlaceDetails /> },
  { path: "/favourites/:userID", element: <Favourites /> }

])
function App() {

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
