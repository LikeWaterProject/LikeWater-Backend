const sql = require("mssql");

const sqlConfig = {
  user: process.env.dbuser,
  password: process.env.dbpassword,
  server: process.env.dbserver,
  database: process.env.database,
};

async function writeConfirm(eventId, userToken, isActive) {
  let finalIsActive = 0;
  let returnObj = {};
  if (typeof isActive === "boolean") {
    if (isActive) finalIsActive = 1;
  }

  try {
    let sqlQuery = `SELECT responseDt, reportedActive from EventResponses WHERE eventId=N'${eventId}' AND userToken=N'${userToken}'`;
    let pool = await sql.connect(sqlConfig);
    let result = await pool.request().query(sqlQuery);
    let currentTimestamp = Date.now();
    if (result.recordset.length > 0) {
      // Maybe here we would check when the last time they responded was
      sqlQuery = `UPDATE EventResponses SET reportedActive=${finalIsActive}, responseDt=${currentTimestamp}
        WHERE eventId=N'${eventId}' AND userToken=N'${userToken}'`;
      reselt = await pool.request().query(sqlQuery);
      returnObj.action = "UPDATED";
    } else {
      sqlQuery = `INSERT INTO EventResponses(eventId, userToken, reportedActive, responseDt)
            VALUES(N'${eventId}', N'${userToken}', ${finalIsActive}, ${currentTimestamp})`;

      result = await pool.request().query(sqlQuery);
      returnObj.action = "INSERTED";
    }

  } catch (ex) {
    returnObj.action = "ERROR";
  }
  return returnObj;
}

module.exports = async function (context, req) {
  sql.on("error", (err) => {
    // handle error here
  });

  if (req.method === "POST") {

    let returnObj = await writeConfirm(req.body.eventId, req.body.userToken, req.body.eventActive);

    if (returnObj.action === "INSERTED") {
      context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify({
          message: "Response added"
        })
      };
    } else if (returnObj.action === "UPDATED") {
      context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify({
          message: "Response updated"
        })
      };
    } else if (returnObj.action === "ERROR") {
      context.res = {
        // status: 200, /* Defaults to 200 */
        status: 500,
        body: JSON.stringify({
          message: "Internal Error"
        })
      };
    }
  } else {
    context.res = {
      status: 400,
      body: "Method not allowed",
    };
  }
};