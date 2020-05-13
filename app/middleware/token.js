var jwt = require('jsonwebtoken');

// returns signed and generate new token
module.exports = {
    async generateToken(user) {
        return new Promise((resolve, reject) => {
            jwt.sign({ data: { _id: user } }, 'secretKey', (err, token) => {
                if (err) {
                    reject("Token can't generate")
                }
                resolve(token)
            })
        })
    },

    async verifyToken(req) {
        var bearerHeader = req.headers.authorization
        if (bearerHeader) {
            var bearer = bearerHeader.split(' ');
            var bearerToken = bearer[1]
            var token = bearerToken
        } else {
            return
        }
        return new Promise((resolve, reject) => {
            jwt.verify(token, 'secretKey', (err, authData) => {
                if (err) {
                    reject("Token didn't match")
                } else {
                    req.user_id = authData.data._id
                    resolve(true)
                }
            })
        })
    }
}