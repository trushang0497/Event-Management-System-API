var express = require("express");
var router = express.Router();
var userModel = require("../models/user");
var tokenGenerate = require("../middleware/token");

// ** Private Functions **

// To email find user
const getUserDetailsByEmail = async (email_address, password) => {
    return new Promise((resolve, reject) => {
        userModel.findOne(
            {
                email_address,
                password,
            },
            (err, userDataFromEmailAddress) => {
                if (err) {
                    reject("User does not exist");
                } else resolve(userDataFromEmailAddress);
            }
        );
    });
};

// To contact number find user
const getUserDetailsByContact = async (contact_number, password) => {
    return new Promise((resolve, reject) => {
        userModel.findOne(
            {
                contact_number,
                password,
            },
            (err, userDataFromContactNo) => {
                if (err) {
                    reject("User does not exist");
                } else resolve(userDataFromContactNo);
            }
        );
    });
};

// For Registration details enter to register
const registerDetailsForUser = async (req) => {
    return new Promise(async (resolve, reject) => {
        const userModels = new userModel({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email_address: req.body.email_address,
            contact_number: req.body.contact_number,
            password: req.body.password,
            gender: req.body.gender,
            date_of_birth: req.body.date_of_birth,
            created_date: Date()
        });
        userModels.save(req, (err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// For get user data from user id
const getUserDataFromUserId = async (req) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({ _id: req }, (err, userData) => {
            if (err) {
                reject("User can't exists");
            } else {
                resolve(userData);
            }
        }
        );
    });
};

// update Profile Data and method
const updateProfileDetails = async (userId, updatedData) => {
    return new Promise(async (resolve, reject) => {
        userModel.findByIdAndUpdate({ _id: userId }, updatedData, (err, item) => {
            if (err) {
                reject(422, err.message);
            } else {
                resolve(item);
            }
        });
    });
};

// ** Public Methods **

// Login API to get details with token to access other pages
router.post("/login", async (req, res) => {
    var userDetail;

    if (req.body.email_address && req.body.password) {
        userDetail = await getUserDetailsByEmail(
            req.body.email_address,
            req.body.password
        );
    } else if (req.body.contact_number && req.body.password) {
        userDetail = await getUserDetailsByContact(
            req.body.contact_number,
            req.body.password
        );
    }

    if (userDetail != undefined && userDetail != null) {
        token = await tokenGenerate.generateToken(userDetail.id);
        var user = {
            first_name: userDetail.first_name,
            last_name: userDetail.last_name,
            email_address: userDetail.email_address,
            contact_number: userDetail.contact_number,
            token: token,
        };
        res.send({ data: user, code: "200" });
    } else {
        res.send({ data: "User Details can't match", code: "500" });
    }
});

// Registration of user
router.post("/registration", async (req, res) => {
    if (req.body.email_address && req.body.password) {
        userDetail = await getUserDetailsByEmail(
            req.body.email_address,
            req.body.password
        );
    } else if (req.body.contact_number && req.body.password) {
        userDetail = await getUserDetailsByContact(
            req.body.contact_number,
            req.body.password
        );
    }

    if (req.body != undefined && userDetail == undefined) {
        var incExp = await registerDetailsForUser(req);
        if (incExp)
            res.send({ data: "Registration Successfully", code: "200" });
    } else {
        res.send({ data: "Unprocessable Entity", code: "422" });
    }
});

// Edit user profile
router.post("/updateProfile", async (req, res) => {
    if (req.headers.authorization != undefined) {
        // verify the token which user enter
        var verifyTokenOrNOt = await tokenGenerate.verifyToken(req);
        if (verifyTokenOrNOt == true) {
            var updatedData = await getUserDataFromUserId(req.user_id);
            if (updatedData) {
                updatedData.first_name = req.body.first_name
                updatedData.last_name = req.body.last_name
                updatedData.email_address
                updatedData.contact_number = req.body.contact_number
                updatedData.date_of_birth = req.body.date_of_birth
                updatedData.gender = req.body.gender
                updatedData.password
                updatedData.created_date
                updatedData.updated_date = Date()
                updatedData.created_by = req.user_id
                updatedData.updated_by = req.user_id
                var updateDetail = await updateProfileDetails(req.user_id, updatedData);
                if (updateDetail) {
                    res.send({ data: "User profile updated successfully", code: "200" });
                }
            }
        } else {
            res.send({ data: "Something is wrong!", code: "500" });
        }
    } else {
        res.send({ data: "Unauthorized", code: "401" });
    }
});

module.exports = router;