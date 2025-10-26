const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const reateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = reateLimit({
    windowMs:10 * 60 * 1000, //10 mins
    max:100
});
app.use(limiter);

//Prevent http param pollution
app.use(hpp());

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