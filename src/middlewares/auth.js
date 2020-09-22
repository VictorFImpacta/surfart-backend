require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).send({ error: 'No token provided' })
    }

    const parts = header.split(' ');

    if (!parts.length === 2) {
        return res.status(401).send({ error: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).send({ error: 'Token malformatted' });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Invalid Token' });
        }

        req.customerId = decoded.id;

        return next();
    });

}