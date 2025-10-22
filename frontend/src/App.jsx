import {BrowserRouter as Router, Routes, Route} from 
'react-router-dom'
 import {ToastContainer} from 'react-toastify'
 import 'react-toastify/dist/ReactToastify.css'
 import Header from './components/Header'
 import Home from './pages/Home'
 import Login from './pages/Login'
 import Register from './pages/Register'
 import MassageShops from './pages/MassageShops'
 import MassageShopDetail from './pages/MassageShopDetail'
 import NewAppointment from './pages/NewAppointment'
import Tickets from './pages/Tickets'
import EditAppointment from './pages/EditAppointment'
 function App() {
 return (
 <>
 <Router>
 <div className="container">
 <Header />
 <Routes> <Route path='/' element={<Home/>} />
 <Route path='/massageshops' element={<MassageShops/>} />
  <Route path='/massageshops/:id' element={<MassageShopDetail/>} />
  <Route path='/new-ticket' element={<NewAppointment/>} />
  <Route path='/tickets' element={<Tickets/>} />
  <Route path='/appointments/:id/edit' element={<EditAppointment/>} />
 <Route path='/login' element={<Login/>} />
 <Route path='/register' element={<Register/>} />
 </Routes>   
</div>
 </Router>
 <ToastContainer />
 </>
 );
 }
 export default App;