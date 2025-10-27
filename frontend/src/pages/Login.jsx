import {useState, useEffect} from 'react'
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
  const {name,email,password,password2}=formData;
 const dispatch = useDispatch()
 const navigate =useNavigate()
 const {user,isLoading, isError, isSuccess, message}=useSelector(state=>state.auth)
 useEffect(()=>{
 if(isError){
 toast.error(message)
 }

  //redirect when logged in
  if (isSuccess && user) {
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