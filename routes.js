// Sanitize Route Path for case insensitivity and default aliasing
function sanitize_path(path) {
    insensitive_path = path.toLowerCase();

    switch (insensitive_path) {
        case '':
        case 'index':
            return 'home';
        default:
            return insensitive_path;
    }
}

// Script Route - serves page scripts
async function route_scripts(req, res) {
    const path = sanitize_path(req.originalUrl.substring(9));

    res.setHeader('content-type', 'application/javascript');
    res.send(path)
}

// Style Route - serves page styles
async function route_styles(req, res) {
    const path = sanitize_path(req.originalUrl.substring(8));

    res.setHeader('content-type', 'text/css');
    res.send(path)
}

// Default Route - serves pages
async function route_default(req, res) {
    const path = sanitize_path(req.originalUrl.substring(1));

    res.setHeader('content-type', 'text/html');
    res.send(path)
}

// Module Exports
module.exports = {
    route_scripts,
    route_styles,
    route_default
}