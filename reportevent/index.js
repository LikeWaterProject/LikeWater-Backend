const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
};
async function insertEvent(args) {
    const sqlQuery = `insert into Events (eventId, eventType, userToken, eventDesc, lat, lon, reportedDt) 
    values (newId(), @eventType, @userToken, @eventDesc, @lat, @lon, @reportedDt)
    `;

    const pool = await sql.connect(sqlConfig)
    const ps = new sql.PreparedStatement(pool);
    ps.input("eventType", sql.NVarChar);
    ps.input("userToken", sql.NVarChar);
    ps.input("eventDesc", sql.NVarChar);
    ps.input("lat", sql.Decimal);
    ps.input("lon", sql.Decimal);
    ps.input("reportedDt", sql.BigInt);
    await ps.prepare(sqlQuery)
    const results = await ps.execute(args);
    ps.unprepare();
    // TODO: Return the id of the event
    return results.rowsAffected;

}
// TODO: Error check sql
module.exports = async function (context, req) {
    const {
        eventType,
        userToken,
        eventDesc,
        coordinates,
    } = req.body;
    // TODO: Error check values
    const results = await insertEvent({
        eventType,
        userToken,
        eventDesc,
        lat: coordinates.lat,
        lon: coordinates.lon,
        reportedDt: Date.now(),
    });

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
    };
    if (results) {
        context.res.body = {
            message: "Event added"
        }
    } else {
        context.res.body = {
            message: "Unable to add event"
        }
    }
};