// error handling
function errorHandler(error,res) {
    console.log(error.message);
    res.status(500).send("Something failed.");
}
module.exports = errorHandler;