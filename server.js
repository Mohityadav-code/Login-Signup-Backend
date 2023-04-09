const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import routes
const authRoutes = require('./server/routes/auth');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use("*", (req, res,next) => {
  // * means all routes
  const error=new Error("404 not found");
  error.message="404 not found";
    error.status=404;

  res.status(404).send("404 not found");
  next(error);
});
const errorHandler = require("./server/utilits/errorhandling");
app.use("*",(error,req,res,next)=>{ //error handling middleware
    res.status(error.status||500).send(error.message)
    errorHandler(error,res);

})