import Dashboard from './Components/Dashboard/Dashboard'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Places from './Components/Places/Places';
import Home from './Components/Home/Home';

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
  { path: "/home/:userID", element: <Home />}

])
function App() {

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
