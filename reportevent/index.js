const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
};
async function insertEvent(args) {
    const sqlQuery = `INSERT INTO Events (eventId, eventType, eventCategory, userToken, eventDesc, lat, lon, reportedDt) 
    OUTPUT Inserted.eventId
    VALUES (newId(), @eventType, @eventCategory, @userToken, @eventDesc, @lat, @lon, @reportedDt)
    `;
    let results;
    try {
        const pool = await sql.connect(sqlConfig)
        const ps = new sql.PreparedStatement(pool);
        ps.input("eventType", sql.NVarChar);
        ps.input("eventCategory", sql.NVarChar);
        ps.input("userToken", sql.NVarChar);
        ps.input("eventDesc", sql.NVarChar);
        ps.input("lat", sql.Decimal(8, 5));
        ps.input("lon", sql.Decimal(8, 5));
        ps.input("reportedDt", sql.BigInt);
        await ps.prepare(sqlQuery)
        results = await ps.execute(args);
        ps.unprepare();
    } catch (err) {
        throw err;
    }

    if (results.rowsAffected) {
        return results.recordset[0];
    }
    return null;
}

module.exports = async function (context, req) {
    const {
        eventType,
        eventCategory,
        userToken,
        eventDesc,
        coordinates,
    } = req.body;
    // TODO: Error check values

    let results;
    try {
        results = await insertEvent({
            eventType,
            eventCategory,
            userToken,
            eventDesc,
            lat: coordinates.lat,
            lon: coordinates.lon,
            reportedDt: Date.now(),
        });
    } catch (err) {
        context.res = {
            status: 500
        };
        if (err.number = 547) {
            context.res.body = {
                error: "Unable to add event. Invalid Event Type."
            };
        } else {
            context.res.body = {
                error: "Internal error"
            };
        }
        return;
    }

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
    };
    if (results) {
        context.res.body = JSON.stringify(results);
    } else {
        context.res.body = {
            message: "Unable to add event"
        };
    }
};