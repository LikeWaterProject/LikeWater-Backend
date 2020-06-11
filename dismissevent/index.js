const sql = require("mssql");

const sqlConfig = {
    user: process.env.dbuser,
    password: process.env.dbpassword,
    server: process.env.dbserver,
    database: process.env.database,
  };

async function writeConfirm(eventId, userToken) {
  try {
    let currentTimestamp = Math.round(new Date().getTime() / 1000);

    let sqlQuery = `INSERT INTO EventDismisses(eventId, userToken, dismissedDt)
          VALUES(N'${eventId}', N'${userToken}', ${currentTimestamp})`;

    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query(sqlQuery);

    return result.rowsAffected;
  } catch (ex) {}
}

module.exports = async function (context, req) {
  sql.on("error", (err) => {
    // handle error here
  });

  if (req.method == "POST") {

    let recordsCreated = writeConfirm(req.body.eventId, req.body.userToken)

    if(recordsCreated) {
        context.res = {
          // status: 200, /* Defaults to 200 */
          body: JSON.stringify({ message: "Update complete" })
        };
    } else {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: JSON.stringify({ message: "No Records Effected" })
          };
    }
  } else {
    context.res = {
      status: 400,
      body: "Method not allowed",
    };
  }
};
