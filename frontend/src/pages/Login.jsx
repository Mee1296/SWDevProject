import { useState, useEffect } from 'react';
 import {toast} from 'react-toastify'
 import {FaSignInAlt} from 'react-icons/fa'
 import {useSelector, useDispatch} from 'react-redux'
 import {login,reset} from '../features/auth/authSlice'
 import { useNavigate } from 'react-router-dom'
 function Login(){
  const [formData,setFormData]=useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;
 const dispatch = useDispatch()
 const navigate =useNavigate()
 const {user,isLoading, isError, isSuccess, message}=useSelector(state=>state.auth)

  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

 useEffect(()=>{
 if(isError){
    toast.error(message);

    // Handle login failure for lockout
    const attemptsData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    const userAttempts = attemptsData[email] || { attempts: 0, lockUntil: null };

    userAttempts.attempts += 1;

    if (userAttempts.attempts >= MAX_LOGIN_ATTEMPTS) {
      userAttempts.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      toast.error(`Account locked for 1 hour due to too many failed login attempts.`);
    }

    attemptsData[email] = userAttempts;
    localStorage.setItem('loginAttempts', JSON.stringify(attemptsData));
 }

  //redirect when logged in
  if (isSuccess && user) {
    // Clear login attempts on successful login
    const attemptsData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    if (attemptsData[email]) {
      delete attemptsData[email];
      localStorage.setItem('loginAttempts', JSON.stringify(attemptsData));
    }

    if (user.token) {
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));

      // Check for upcoming appointment reminders
      const checkReminders = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/v1/appointments', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.ok) {
            const { data: appointments } = await res.json();
            const now = new Date();
            const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            appointments.forEach(appt => {
              const apptDate = new Date(appt.apptDate);
              if (apptDate > now && apptDate <= twentyFourHoursFromNow) {
                toast.info(`Reminder: You have an appointment tomorrow at ${apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
              }
            });
          }
        } catch (error) {
          console.error('Failed to fetch appointment reminders:', error);
        }
      };

      checkReminders();
    }
    navigate('/');
 }

 dispatch(reset())
 },[isError, isSuccess, user, message, navigate, dispatch])
  const onChange = (e) =>{
    setFormData((prevState)=>({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  }
  const onSubmit =(e) => {
    e.preventDefault()

    // Check for lockout before attempting to log in
    const attemptsData = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    const userAttempts = attemptsData[email];

    if (userAttempts && userAttempts.lockUntil && userAttempts.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((userAttempts.lockUntil - Date.now()) / (1000 * 60));
      toast.error(`Account is locked. Please try again in ${remainingTime} minutes.`);
      return;
    }

    const userData={
      email,
      password
    }
    dispatch(login(userData))
  }

  return(
    <>
      <section className="heading">
        <h1>
          <FaSignInAlt /> Login
        </h1>
        <p>Please login to get support</p>
         </section>
      <section className='form'>
        <form onSubmit={onSubmit}>          
          <div className="form-group">
            <input type="email" className='form-control' id='email' name='email' value={email} onChange={onChange} placeholder='Enter Your email' required/>
          </div>
          <div className="form-group">
            <input type="password" className='form-control' id='password' name='password' value={password} onChange={onChange} placeholder='Enter Your password' required/>
          </div>          
          <div className='form-group'>
            <button className='btn btn-block'>Submit</button>
          </div>
        </form>
      </section>
    </>
  )
 }
 export default Login;