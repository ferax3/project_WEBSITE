import {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUserShield } from "react-icons/fa";
import { BsFillShieldLockFill } from 'react-icons/bs';
import { AiOutlineSwapRight } from 'react-icons/ai';
import { MdMarkEmailRead } from 'react-icons/md';
import { FaRegFaceSmileBeam } from "react-icons/fa6";
import Axios from 'axios'


import "./Register.css"
import "../../App.css"
import video from '../../LoginAssets/116660-708909854_small.mp4'


const Register = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const navigateTo = useNavigate()
  const createUser = (e) => {
    e.preventDefault();
    Axios.post('http://localhost:3002/register', {
      Email: email,
      Name: name,
      Password: password
    }). then(()=>{
      navigateTo('/')
      setEmail('')
      setName('')
      setPassword('')
    })
  }


  return (
    <>
      <div className="blob-outer-container">
        <div className="blob-inner-container">
          <div className="blob"></div>
        </div>
      </div>
      <div className='registerPage flex'>
        <div className="container flex">
          <div className="videoDiv">
            <video src= {video} autoPlay muted loop></video>
            <div className="textDiv">
              <h2 className="title">Знайдіть час на відпочинок</h2>
              <p className='subtitle'>"Світ такий великий. Пішли відкривати його" - Джордж Малорі</p>
            </div>

            <div className="footerDiv flex">
              <span className="text">Маєте обліковий запис?</span>
              <Link to='/'>
                <button className='btn'> Вхід</button>
              </Link>
            </div>
          </div>

          <div className="formDiv flex">
            <div className="headerDiv">
              <h3>Познайомимось?</h3>
              <div className="smile">
                <FaRegFaceSmileBeam size={24}/>
              </div>
            </div>

            <form action="" className='form grid'>

            <div className="inputDiv">
                <label htmlFor="email">Email</label>
                <div className="input flex">
                  <MdMarkEmailRead className='icon'/>
                  <input type="email" id='email' placeholder='Введіть email' onChange={(event)=>{
                    setEmail(event.target.value)
                  } }/>
                </div>
              </div>              
              
              <div className="inputDiv">
                <label htmlFor="name">Ваше ім'я</label>
                <div className="input flex">
                  <FaUserShield className='icon'/>
                  <input type="text" id='name' placeholder="Введіть ім'я" onChange={(event)=>{
                    setName(event.target.value)
                  } }/>
                </div>
              </div>

              <div className="inputDiv">
                <label htmlFor="password">Пароль</label>
                <div className="input flex">
                  <BsFillShieldLockFill className='icon'/>
                  <input type="password" id='password' placeholder='Введіть пароль' onChange={(event)=>{
                    setPassword(event.target.value)
                  } }/>
                </div>
              </div>

              <button type='submit' className='btn flex' onClick={createUser}>
                <span>Зареєструватись</span>
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

export default Register