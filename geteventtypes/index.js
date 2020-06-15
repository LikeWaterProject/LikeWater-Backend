const sql = require("mssql");

const sqlConfig = {
  user: process.env.dbuser,
  password: process.env.dbpassword,
  server: process.env.dbserver,
  database: process.env.database,
};

async function getSqlData() {
  let sqlQuery = `select eventType, description from EventTypes where showInApp = 1`;

  let pool = await sql.connect(sqlConfig)
  // let result1 = await pool.request()
  //     .input('input_parameter', sql.Int, value)
  //     .query('select * from mytable where id = @input_parameter')
  let result = await pool.request()
    .query(sqlQuery);

  // console.dir(result1)


  //return result.recordset;
  return [{
      eventCategory: "POLICE",
      eventType: "Police Type 1",
      description: "Reported police event 1"
    },
    {
      eventCategory: "POLICE",
      eventType: "Police Type 2",
      description: "Reported police event 2"
    },
    {
      eventCategory: "AID",
      eventType: "Aid Type 1",
      description: "Reported aid event 1"
    },
    {
      eventCategory: "AID",
      eventType: "Aid Type 2",
      description: "Reported aid event 2"
    },
    {
      eventCategory: "INFO",
      eventType: "Info Type 1",
      description: "Reported info event 1"
    },
    {
      eventCategory: "INFO",
      eventType: "Info Type 2",
      description: "Reported info event 2"
    },
    {
      eventCategory: "SAFETY",
      eventType: "Safety Type 1",
      description: "Reported safety event 1"
    },
    {
      eventCategory: "SAFETY",
      eventType: "Safety Type 2",
      description: "Reported safety event 2"
    },
    {
      eventCategory: "SOS",
      eventType: "SOS Type 1",
      description: "Reported sos event 1"
    },
    {
      eventCategory: "SOS",
      eventType: "SOS Type 2",
      description: "Reported sos event 2"
    },
  ]
}

module.exports = async function (context, req) {
  dbResults = await getSqlData();

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dbResults)
  }
};