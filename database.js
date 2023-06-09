const { AceBase } = require('acebase');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const db = new AceBase('data', {sponsor: true, logLevel: 'warn'});

// Database Collections
const userCollection = db.ref('users');
const pageCollection = db.ref('pages');
const templateCollection = db.ref('templates');
const componentCollection = db.ref('components');

// Get a User from the database by username
async function getUserByUsername(username, newSession = false) {
    return (await userCollection.query()
        .filter('username', '==', username)
        .take(1)
        .get())
        .getValues()[0];
}

// Get a User from the database by username
async function getUserBySession(session) {
    return (await userCollection.query()
        .filter('sessions', 'contains', session)
        .take(1)
        .get())
        .getValues()[0];
}

// Create a user in the database
async function createUser(username, password,
    name_first, name_last, name_preferred, email, phone) {
    const passwordHash = await bcrypt.hash(password, 12);
    const newSession = uuid.v4();

    const user = {
        username: username,
        password: passwordHash,
        name: {
            first: name_first,
            preferred: name_preferred,
            last: name_last,
        },
        email: email,
        phone: phone,
        sessions: [
            newSession
        ],
        role: 'unauthorized'
    }

    userCollection.push(user)

    return [user, newSession]
}

// Create a new session for the given user
async function generateNewSessionForUser(username) {
    const newSession = uuid.v4()

    const path = (await userCollection.query()
        .filter('username', '==', username)
        .take(1)
        .get({ snapshots: false }))[0].path;

    await database.ref(`${path}/sessions`).transaction(async snap => {
        const sessions = snap.val();

        sessions.push(newSession);

        return sessions
    });

    return newSession;
}

// Clear User Session Token on Logout
async function clearUserSessionToken(session) {
    const path = (await userCollection.query()
        .filter('sessions', 'contains', session)
        .take(1)
        .get({ snapshots: false }))[0].path;

    await database.ref(`${path}/sessions`).transaction(async snap => {
        const sessions = snap.val();
        const sessionIndex = sessions.indexOf(session);
      
        if (sessionIndex !== -1) {
        sessions.splice(sessionIndex, 1);
        }

        return sessions;
    });
}

// Get Site Name configuration field
async function getSiteName() {
    return await getOrSetDatabaseValue('config/site/name', 'My New Site');
}

// Get Background Color configuration field
async function getColor_background() {
    console.log(await getOrSetDatabaseValue('config/colors/background', 'rgba(187, 187, 187, 1)'));
}

// Get Gradient Color configuration fields
async function getColor_gradient() {
    return {
        a: await getOrSetDatabaseValue('config/colors/gradient/a', 'rgba(156,25,180,1)'),
        b: await getOrSetDatabaseValue('config/colors/gradient/b', 'rgba(141,0,255,1)'),
        angle: await getOrSetDatabaseValue('config/colors/gradient/angle', '130')
    }
}


async function getOrSetDatabaseValue(path, defaultValue) {
    const snapshot = await db.ref(path).get();

    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        await db.ref(path).set(defaultValue);
        return defaultValue;
    }
}

// Module Exports
module.exports = {
    getUserByUsername,
    getUserBySession,
    createUser,
    generateNewSessionForUser,
    clearUserSessionToken,
    getSiteName,
    getColor_background,
    getColor_gradient
}