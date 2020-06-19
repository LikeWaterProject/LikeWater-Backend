const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
};
// TODO: Error check sql
async function fetchEventDetails(eventId) {
    const query = `
        select Events.eventId, Events.eventType, Events.userToken, Events.eventDesc, Events.lat, Events.lon, Events.reportedDt,
        SUM(CASE WHEN [EventResponses].[reportedActive] = 1 THEN 1 ELSE 0 END) over (partition by Events.eventId) confirms, 
        SUM(CASE WHEN [EventResponses].[reportedActive] = 0 THEN 1 ELSE 0 END) over (partition by Events.eventId) dismisses 
        from Events left join EventResponses on Events.eventId = EventResponses.eventId
        WHERE Events.eventId = @eventId;
    `;
    let record;
    try {
        const pool = await sql.connect(sqlConfig);

        const ps = new sql.PreparedStatement(pool);
        ps.input("eventId", sql.UniqueIdentifier);
        await ps.prepare(query);
        const result = await ps.execute({
            eventId
        });
        ps.unprepare();
        if (result.recordset.length > 0) {
            record = result.recordset[0];
        } else {
            record = {};
        }
    } catch (err) {
        throw err;
    }
    return record;
}

module.exports = async function (context, req) {
    const eventId = req.query.eventId || (req.body ? req.body.eventId : null);
    if (!eventId) {
        context.res = {
            status: 400,
            body: {
                error: "No eventId provided"
            }
        };
        return;
    }
    let dbResults;
    try {
        dbResults = await fetchEventDetails(eventId);
    } catch (err) {
        context.res = {
            status: 500,
            body: {
                error: "Internal error",
            }
        }
        return;
    }
    if (dbResults.lat) {
        dbResults.coordinates = {
            lat: dbResults.lat,
            lon: dbResults.lon
        };
        delete dbResults.lat;
        delete dbResults.lon;
    }

    context.res = {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dbResults)
    }
};