const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
};
async function insertEvent(args) {
    const sqlQuery = `INSERT INTO Events (eventId, eventType, userToken, eventDesc, lat, lon, reportedDt) 
    OUTPUT Inserted.eventId
    VALUES (newId(), @eventType, @userToken, @eventDesc, @lat, @lon, @reportedDt)
    `;
    let results;
    try {
        const pool = await sql.connect(sqlConfig)
        const ps = new sql.PreparedStatement(pool);
        ps.input("eventType", sql.NVarChar);
        ps.input("userToken", sql.NVarChar);
        ps.input("eventDesc", sql.NVarChar);
        ps.input("lat", sql.Decimal);
        ps.input("lon", sql.Decimal);
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
        userToken,
        eventDesc,
        coordinates,
    } = req.body;
    // TODO: Error check values

    let results;
    try {
        results = await insertEvent({
            eventType,
            userToken,
            eventDesc,
            lat: coordinates.lat,
            lon: coordinates.lon,
            reportedDt: Date.now(),
        });
    } catch (err) {
        context.res = {
            status: 500,
            body: {
                error: "Internal error"
            }
        }
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