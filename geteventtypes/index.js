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
  
  return result.recordset;
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
