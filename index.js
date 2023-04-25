const express = require('express');
const cookieParser = require('cookie-parser')

// Load Modules
const auth = require('./auth.js');
const routes = require('./routes.js');

// Create Express App
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Authentication Router
authRouter = express.Router();
app.use('/auth', authRouter);

// Authentication Endpoints
authRouter.post('/create', auth.endpoint_createUser);
authRouter.post('/login', auth.endpoint_loginUser);
authRouter.delete('/logout', auth.endpoint_logoutUser);

// Authentication Routes
app.get('/login', auth.route_login);
app.get('/create', auth.route_create);

// Portal Router
portalRouter = express.Router();
app.use('/portal', portalRouter);
portalRouter.use(auth.middleware_secure);

// Support Routes
app.get('/styles/*', routes.route_styles);
app.get('/scripts/*', routes.route_scripts);

// Default Route
app.use(routes.route_default);

// Start App
app.listen(port);