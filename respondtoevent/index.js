const sql = require("mssql");

const sqlConfig = {
  user: process.env.dbuser,
  password: process.env.dbpassword,
  server: process.env.dbserver,
  database: process.env.database,
};

async function writeConfirm(eventId, userToken, isActive) {
  let finalIsActive = 0
  if(typeof isActive === "boolean") {
    if(isActive) finalIsActive = 1;
  }

  try {
    let currentTimestamp = Date.now();

    let sqlQuery = `INSERT INTO EventResponses(eventId, userToken, reportedActive, responseDt)
          VALUES(N'${eventId}', N'${userToken}', ${finalIsActive}, ${currentTimestamp})`;

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

    let recordsCreated = writeConfirm(req.body.eventId, req.body.userToken, req.body.eventActive);

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
