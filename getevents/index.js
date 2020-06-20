const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
};

async function fetchEvents(args) {
    const {
        radius,
        userToken,
        lat,
        lon
    } = args;

    const query = `
        SELECT *, ISNULL([GetEvents].confirmCount, 0) as confirms, ISNULL([GetEvents].dismissCount, 0) as dismisses FROM [dbo].[GetEvents] (@lat, @lon, @radius, @userToken)
    `;
    const pool = await sql.connect(sqlConfig);
    const ps = new sql.PreparedStatement(pool);
    ps.input("lat", sql.Decimal(8, 5));
    ps.input("lon", sql.Decimal(8, 5));
    ps.input("radius", sql.Int);
    ps.input("userToken", sql.NVarChar(255));
    await ps.prepare(query);
    const results = await ps.execute({
        lat,
        lon,
        radius,
        userToken
    });
    ps.unprepare();

    return results.recordset;
}

function checkParams(args, context) {
    const {
        radius,
        userToken,
        lat,
        lon
    } = args;

    if (radius <= 0 || radius == null) {
        context.res = {
            status: 400,
            body: {
                message: "Radius must be a positive number"
            }
        };
        return false;
    }
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        context.res = {
            status: 400,
            body: {
                message: "Coordinates out of range"
            }
        };
        return false;
    }
    if (!userToken) {
        context.res = {
            status: 400,
            body: {
                message: "No userToken provided"
            }
        };
        return false;
    }
    return true;
}

module.exports = async function (context, req) {
    const radius = req.query.radius || (req.body ? req.body.radius : null);
    const userToken = req.query.userToken || (req.body ? req.body.userToken : null);
    const {
        lat,
        lon
    } = req.body.coordinates;
    const params = {
        lat,
        lon,
        radius,
        userToken
    };
    if (!checkParams(params, context)) {
        return;
    }

    let dbResults = await fetchEvents(params);

    dbResults = dbResults.map((event) => {
        if (event.lat !== null) {
            event.coordinates = {
                lat: event.lat,
                lon: event.lon
            };
            delete event.lat;
            delete event.lon;
        }
        delete event.confirmCount;
        delete event.dismissCount;
        return event;
    })

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dbResults)
    }
};