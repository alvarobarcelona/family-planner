const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('Successfully connected to the database!');
    return client.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
