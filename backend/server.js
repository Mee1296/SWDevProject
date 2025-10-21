const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//cors
app.use(cors({
  origin: ['http://localhost:3000','http://127.0.0.1:3000'],
  credentials: true
}));
//Route files
const massageshops = require('./routes/massageshops')
const auth = require('./routes/auth');
const appointments = require('./routes/Appointments');

//Route
app.use('/api/v1/massageshops', massageshops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);

//Enable extended query parser
app.set('query parser', 'extended');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server is running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('uncaughtRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server & exit process
    server.close(()=>process.exit(1));
});