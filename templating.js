const database = require('./database.js');
const eta = require('eta');
const path = require('path');

// Configure Eta
eta.configure({
    views: path.join(__dirname, "static/templates")
})

// Generate the data to be inserted into the template
async function generateTemplateData(req, data = {}) {
    let templateData = {
        req: req,
        site: {
            name: await database.getSiteName()
        },
        colors: {
            background: await database.getColor_background(),
            gradient: await database.getColor_gradient()
        },
        components: {},
        ...data
    }

    templateData.components.head = await eta.renderFile('component_head', templateData)

    return templateData;
}

// Module exports
module.exports = {
    eta,
    generateTemplateData
}