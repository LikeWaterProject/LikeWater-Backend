const sql = require("mssql");

const sqlConfig = {
  user: process.env.dbuser,
  password: process.env.dbpassword,
  server: process.env.dbserver,
  database: process.env.database,
};

async function getSqlData() {
  let sqlQuery = `select eventCategory, eventType from EventTypes where showInApp = 1 order by eventCategory, eventType`;

  let pool = await sql.connect(sqlConfig)

  let result = await pool.request()
    .query(sqlQuery);

  return result.recordset;

}

module.exports = async function (context, req) {
  dbResults = await getSqlData();
  categories = {};
  dbResults.map(({
    eventCategory,
    eventType
  }) => {
    if (!categories[eventCategory]) {
      categories[eventCategory] = [];
    }
    categories[eventCategory].push(eventType);
  });



  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(categories)
  }
};