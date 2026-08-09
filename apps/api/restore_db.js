const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgres://postgres:eXnWcn0Z%4012@db.cysomeimnzlshyiusono.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function restoreDb() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB.');

    const sqlFilePath = path.join(__dirname, 'gymforge_backup_fresh.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, { encoding: 'utf-8' });

    console.log('Executing SQL dump...');
    // Some SQL dumps have multiple statements, client.query can execute them
    await client.query(sqlQuery);
    console.log('SQL dump executed successfully.');
  } catch (err) {
    console.error('Error executing SQL dump:', err);
  } finally {
    await client.end();
  }
}

restoreDb();
