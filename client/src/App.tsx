import Dashboard from './Components/Dashboard/Dashboard'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Places from './Components/Places/Places';

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

])
function App() {

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
