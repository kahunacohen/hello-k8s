const { Pool } = require("pg");

function getPool() {
  return new Pool({
    user: "web",
    host: "postgres",
    database: "web",
    password: "akhd5",
    port: 5432,
  });
}
function createFilmsTable(pool) {
  pool.query(
    `
  CREATE TABLE IF NOT EXISTS films (
    title       varchar(40) NOT NULL,
    kind        varchar(10)
);`,
    (_err, _queryRes) => {}
  );
}

function getFilms(pool) {
  return new Promise((resolve) => {
    pool.query(`SELECT title, kind FROM "films";`, (err, queryRes) => {
      resolve(queryRes.rows);
    });
  });
}
async function populateFilmsTable(pool) {
  const films = await getFilms(pool);
  if (films.length === 0) {
    pool.query(
      `INSERT INTO "films"(title, kind)
    VALUES('Superman', 'drama');`,
      (_, queryRes) => {
        return queryRes.rows;
      }
    );
  }
}

module.exports = {
  createFilmsTable,
  getFilms,
  getPool,
  populateFilmsTable,
};
