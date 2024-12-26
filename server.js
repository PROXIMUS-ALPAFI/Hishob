const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const dotenv = require("dotenv");
const col = require("colours");
const connectdb = require("./config/connectdb");

// Call env
dotenv.config();

// Call db
connectdb();

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// Routes
// 1.user route
app.use('/api/v1/users', require('./routers/userRoute'));
// 2. transction route
app.use('/api/v1/transactions',require('./routers/transactionRoute'))
//app.use('/api/v1/users', require('./routers/userRoute'));


const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
