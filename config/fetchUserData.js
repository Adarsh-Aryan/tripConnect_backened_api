const jwt = require('jsonwebtoken')
const jwt_secret=process.env.JWT_SECRET_KEY

const fetchUserEmail = (req, res, next) => {

    const token = req.headers['auth-token']

    if (!token) {
        res.status(422).json({ token: 'Please Provide Token', auth: false })
        return;
    }

    try {

        const userData = jwt.verify(token, jwt_secret)

        req.email = userData.email

        next()

    } catch (error) {
        res.status(400).json({token:'Invalid Token',auth:false})
        
    }



}

module.exports = { fetchUserEmail }