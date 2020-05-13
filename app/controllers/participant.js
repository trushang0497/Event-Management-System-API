var express = require("express");
var router = express.Router();
var tokenGenerate = require("../middleware/token");
var participantModel = require("../models/participant");
var userModel = require("../models/user");
var eventModel = require("../models/event");

// ** Private functions

// For getting participants list
const getPaticipantList = async () => {
    return new Promise(async (resolve, reject) => {
        participantModel.find((err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For check join/participant in any event
const CheckJoinEventDetail = async (userId, req) => {
    return new Promise(async (resolve, reject) => {
        participantModel.findOne({ user_id: userId, event_id: req.body.event_id, updated_date: { $gte: new Date(new Date().toUTCString()) }, join_leave_flag: 'J' }, (err, participantDetails) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(participantDetails);
            }
        });
    });
};

// For post the data for joining event
const postJoinEventDetail = async (userId, req) => {
    return new Promise(async (resolve, reject) => {
        const participantModels = new participantModel({
            event_id: req.body.event_id,
            user_id: userId,
            join_leave_flag: 'J',          // [ J - join / L - leave ]
            join_date: new Date(),
            updated_date: new Date().setDate(new Date().getDate() + 1)
        });
        participantModels.save(req, (err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For checking if event already leave or not from particular user
const CheckLeaveEventDetail = async (userId, req) => {
    return new Promise(async (resolve, reject) => {
        participantModel.findOne({ user_id: userId, event_id: req.body.event_id, join_leave_flag: { $ne: 'L' } }, (err, participantDetails) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(participantDetails);
            }
        });
    });
};

// For update flag and updated day of participants details
const postLeaveEventDetail = async (id, req) => {
    return new Promise((resolve, reject) => {
        req.save((err, item) => {
            if (err) {
                reject(422, err.message)
            } else {
                resolve(item)
            }
        })
    })
};

// For getting user details for bind the data with creator list
const getUserDetailFromUserId = async (req) => {
    return new Promise(async (resolve, reject) => {
        userModel.findById({ _id: req.user_id }, (err, userData) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(userData);
            }
        });
    });
};

// For getting event details for bind the data with participants list
const getEventDetailFromEventId = async (req) => {
    return new Promise(async (resolve, reject) => {
        eventModel.findById({ _id: req.event_id }, (err, eventData) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(eventData);
            }
        });
    });
};

// ** Public methods

// For participants list
router.get("/participantList", async (req, res) => {
    var newObj = [];
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body != undefined) {
            var participantList = await getPaticipantList();
            if (participantList) {
                for (let i = 0; i < participantList.length; i++) {
                    eventDetail = await getEventDetailFromEventId(participantList[i]);
                    userDetail = await getUserDetailFromUserId(participantList[i]);
                    newObj.push({ participantDetail: participantList[i], eventDetail: eventDetail, userDetail: userDetail })
                    // NOTE : participantList, entDetail, userDetail this three push in one obj but it cant done so in UI side it cant display.
                }
                res.send({ data: newObj, code: "200" });
            } else {
                res.send({ data: "Participants doesn't exist", code: "500" });
            }
        } else {
            res.send({ data: "Unprocessable Entity", code: "422" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

// For join Event
router.post("/joinEvent", async (req, res) => {
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body != undefined) {
            var joinEventDetail = await CheckJoinEventDetail(req.user_id, req);
            if (joinEventDetail == null || joinEventDetail == undefined) {
                var postData = await postJoinEventDetail(req.user_id, req)
                if (postData)
                    res.send({ data: 'Join successfully', code: "200" });
            } else {
                res.send({ data: "Participant join already", code: "500" });
            }
        } else {
            res.send({ data: "Unprocessable Entity", code: "422" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

// For Leave event
router.post("/leaveEvent", async (req, res) => {
    var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
    if (verifyTokenOrNOt == true) {
        if (req.body != undefined) {
            var joinEventDetail = await CheckLeaveEventDetail(req.user_id, req);
            if (joinEventDetail != null || joinEventDetail != undefined) {
                joinEventDetail.join_leave_flag = 'L'
                joinEventDetail.updated_date = Date()
                var postData = await postLeaveEventDetail(joinEventDetail.id, joinEventDetail)
                if (postData)
                    res.send({ data: 'Leave successfully', code: "200" });
            } else {
                res.send({ data: "Participant leave already", code: "500" });
            }
        } else {
            res.send({ data: "Unprocessable Entity", code: "422" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

module.exports = router;