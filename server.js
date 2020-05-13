var express = require('express')
var http = require('http');
var mongoDB = require('mongoose');
var app = new express();
const bodyParser = require('body-parser')
var cors = require('cors')
var fs = require('fs');

app.use(cors())

// For port
var PORT = 3200

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Define page path - For Routing
var userController = require('./app/controllers/user')
var eventController = require('./app/controllers/event')
var participantController = require('./app/controllers/participant')

// Define page path for URL - For Routing
app.use("/user", userController)
app.use("/event", eventController)
app.use("/participant", participantController)

// Connection string
var CONNECTION_URL = "mongodb+srv://Test:gQ8KHsbyqWTX7eza@eventhendling-t7okr.mongodb.net/eventManagement?retryWrites=true&w=majority";

// For cros origin
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Tableau-Auth");
    next();
});

// For default page
app.use(express.static('./public'))

// Error 404 if page is not found
app.use((req, res, next) => {
    res.status(404).send("Page not found")
})

// connect to DB with log
var server = http.createServer(app);
server.listen(PORT, () => console.log('server is running'));
var db = mongoDB.connect(CONNECTION_URL, function (error, response) {
    if (error) {
        console.log(error);
    } else {
        console.log("Connect to" + db);
    }
})