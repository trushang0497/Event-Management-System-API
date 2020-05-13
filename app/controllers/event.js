var express = require("express");
var router = express.Router();
var eventModel = require("../models/event");
var userModel = require("../models/user");
var tokenGenerate = require("../middleware/token");

// ** Private functions **

// For create event
const getEventDetailsByTileAndDescription = async (title, description) => {
    return new Promise((resolve, reject) => {
        eventModel.findOne({ title }, { description }, (err, eventData) => {
            if (err) {
                reject("Event does not exist");
            } else resolve(eventData);
        }
        );
    });
};

// For generating event
const generateEvent = async (userId, req) => {
    return new Promise(async (resolve, reject) => {
        const eventModels = new eventModel({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            place: req.body.place,
            paticipants: req.body.paticipants,
            max_count: req.body.max_count,
            event_created_by: userId,
            created_date: Date()
        });
        eventModels.save(req, (err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For List of event
const getEventList = async () => {
    return new Promise(async (resolve, reject) => {
        eventModel.find((err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For getting event creator list
const getEventCreatorList = async () => {
    return new Promise(async (resolve, reject) => {
        eventModel.find((err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For getting user details for bind the data with creator list
const getUserDetailFromUserId = async (req) => {
    return new Promise(async (resolve, reject) => {
        userModel.findById({ _id: req.event_created_by }, (err, userData) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(userData);
            }
        });
    });
};

// ** Public Methods **

// For create event
router.post("/createEvent", async (req, res) => {
    var eventDetail;
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body.title && req.body.description) {
            eventDetail = await getEventDetailsByTileAndDescription(
                req.body.title,
                req.body.description
            );
        }

        if (req.body != undefined && eventDetail == null) {
            var eventGeneate = await generateEvent(req.user_id, req);
            if (eventGeneate)
                res.send({ data: "Event created successfully", code: "200" });
        } else {
            res.send({ data: "Event already exist", code: "500" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

// For List of event
router.get("/eventList", async (req, res) => {
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body != undefined) {
            var eventList = await getEventList();
            if (eventList)
                res.send({ data: eventList, code: "200" });
        } else {
            res.send({ data: "Event doesn't exist", code: "500" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

// For event creators list
router.get("/creatorList", async (req, res) => {
    var userDetail, newObj = [];
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body != undefined) {
            var eventCreatorList = await getEventCreatorList();
            if (eventCreatorList) {
                for (let i = 0; i < eventCreatorList.length; i++) {
                    userDetail = await getUserDetailFromUserId(eventCreatorList[i]);
                    newObj.push({ eventDetail: eventCreatorList[i], userDetail: userDetail })
                    // var newObj = eventCreatorList[i]
                    // newObj.push(userDetail)

                    // NOTE : eventCreatorList, userDetail this 2 push in one obj but it cant done so in UI side it cant display.
                }
                res.send({ data: newObj, code: "200" });
            }
        } else {
            res.send({ data: "Event doesn't exists", code: "500" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

module.exports = router;