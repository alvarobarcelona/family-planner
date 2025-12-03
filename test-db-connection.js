const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://admin:password123@localhost:5432/family_planner',
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
