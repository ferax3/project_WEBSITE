import Dashboard from './Components/Dashboard/Dashboard'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'

import './App.css'

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard/:userID", element: <Dashboard /> },
  // {
  //   path: "/",
  //   element: <div><Login/></div>
  // },
  // {
  //   path: "/register",
  //   element: <div><Register/></div>
  // },
  // {
  //   path: "/dashboard",
  //   element: <div><Dashboard/></div>
  // },
])
function App() {

  return (
    <div>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
