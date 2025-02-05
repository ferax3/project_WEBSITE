import { useEffect, useState } from 'react'
import Axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from 'react-icons/bs';
import { AiOutlineSwapRight } from 'react-icons/ai';


import "./Login.css"
import "../../App.css"
import video from '../../LoginAssets/116660-708909854_small.mp4'


const Login = () => {
  const [loginName, setLoginName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const navigateTo = useNavigate()
  const [loginStatus, setLoginStatus] = useState('')
  const [statusHolder, setStatusHolder] = useState('message')

  const loginUser = (e) => { 
    e.preventDefault();
    Axios.post('http://localhost:3002/login', {
      LoginName: loginName,
      LoginPassword: loginPassword
    }). then((response)=>{
      if (response.data.message === 'Login successful') {
        navigateTo(`/dashboard/${response.data.userID}`, { state: { name: response.data.user } });
      } else {
        setLoginStatus(`Credentials Don't Exist!`);
        navigateTo('/');
      }
    });
  }

  useEffect(()=>{
    if(loginStatus !== ''){
      setStatusHolder('showMessage')
      setTimeout(() => {
        setStatusHolder('message')
      }, 4000)
    }
  }, [loginStatus])

  const onSubmit = () =>{
    setLoginName('')
    setLoginPassword('')
  }

  return (
    <>
      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>
      <div className='loginPage flex'>
        <div className="container flex">
          <div className="videoDiv">
            <video src= {video} autoPlay muted loop></video>
            <div className="textDiv">
              <h2 className="title">Знайдіть час на відпочинок</h2>
              <p className='subtitle'>"Світ такий великий. Пішли відкривати його" - Джордж Малорі</p>
              {/* <p className='subtitle'>Джордж Малорі</p> */}
            </div>

            <div className="footerDiv flex">
              <span className="text">У вас немає облікового запису?</span>
              <Link to='/register'>
                <button className='btn'> Реєстрація</button>
              </Link>
            </div>
          </div>

          <div className="formDiv flex">
            <div className="headerDiv">
              <h3>З поверненням!</h3>
            </div>

            <form action="" className='form grid' onSubmit={onSubmit}>
              <span className={statusHolder}>{loginStatus}</span>

              <div className="inputDiv">
                <label htmlFor="name">Ім'я</label>
                <div className="input flex">
                  <FaUserShield className='icon'/>
                  <input type="text" id='name' placeholder="Введіть ім'я" onChange={(event)=>{
                    setLoginName(event.target.value)
                  } }/>
                </div>
              </div>

              <div className="inputDiv">
                <label htmlFor="password">Пароль</label>
                <div className="input flex">
                  <BsFillShieldLockFill className='icon'/>
                  <input type="password" id='password' placeholder='Введіть пароль' onChange={(event)=>{
                    setLoginPassword(event.target.value)
                  } }/>
                </div>
              </div>

              <button type='submit' className='btn flex' onClick={loginUser}>
                <span>Увійти</span>
                <AiOutlineSwapRight className='icon'/>
              </button>
              
              <span className='forgotPassword'>Забули пароль? <a href="">Натисніть</a></span>

            </form>
          </div>


        </div>
      </div>
    </>
  )
}

export default Login