const database = require('./database.js');

// Handle User Creation
async function endpoint_createUser(req, res) {
    if (await database.getUserByUsername(req.body.username)) {
        res.status(409).send({ msg: 'Existing User' })
    } else {
        const [user, newSession] = await database.createUser(
            req.body.username, req.body.password, req.body.name_first, req.body.name_last,
            req.body.name_preferred, req.body.email, req.body.phone
        );

        setAuthToken(res, newSession);
        res.send({})

        return
    }
}

// Handle Logging In Users
async function endpoint_loginUser(req, res) {
    let user = await database.getUserByUsername(req.body.username);

    if (user) {
        const newSession = await database.generateNewSessionForUser(req.body.username);

        if (await bcrypt.compare(req.body.password, user.password)) {
            setAuthCookie(res, newSession);
            res.send({});

            return
        }
    }

    res.status(401).send({ msg: 'Incorrect Credentials' });
}

// Handle Logging Out Users
async function endpoint_logoutUser(req, res) {
    const sessionToken = req?.cookies.session;
    database.clearUserSessionToken(sessionToken);
    res.clearCookie('session');
    res.status(204).end();
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, sessionToken) {
    res.cookie('session', sessionToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

// Module Exports
module.exports = {
    endpoint_createUser,
    endpoint_loginUser,
    endpoint_logoutUser
}