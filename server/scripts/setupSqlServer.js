import sql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function setupSqlServerDatabase() {
  let pool;
  
  try {
    console.log('🚀 Starting SQL Server database setup...');
    console.log(`📍 Server: ${config.server}`);
    console.log(`👤 User: ${config.user}`);
    console.log(`🔐 Encrypt: ${config.options.encrypt}`);
    console.log(`🔒 Trust Certificate: ${config.options.trustServerCertificate}`);
    
    // Step 1: Connect to master database to create TF_genie
    console.log('\n🔌 Connecting to SQL Server (master database)...');
    const masterConfig = { ...config, database: 'master' };
    pool = await sql.connect(masterConfig);
    console.log('✅ Connected to master database');
    
    // Step 2: Create TF_genie database if it doesn't exist
    console.log('\n🏗️  Checking if TF_genie database exists...');
    const checkDbResult = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = 'TF_genie'
    `);
    
    if (checkDbResult.recordset.length === 0) {
      console.log('📦 Creating TF_genie database...');
      await pool.request().query('CREATE DATABASE TF_genie');
      console.log('✅ TF_genie database created successfully!');
    } else {
      console.log('ℹ️  TF_genie database already exists');
    }
    
    // Close master connection
    await pool.close();
    
    // Step 3: Connect to TF_genie database
    console.log('\n🔗 Connecting to TF_genie database...');
    const tfGenieConfig = { ...config, database: 'TF_genie' };
    pool = await sql.connect(tfGenieConfig);
    console.log('✅ Connected to TF_genie database');
    
    // Step 4: Read and execute the latest schema creation script
    const schemaPath = path.join(__dirname, '../../supabase/migrations/20250628072814_autumn_unit.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    console.log('\n📝 Reading database schema...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements and execute them
    const statements = schemaSQL
      .split('GO')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('USE'));
    
    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.request().query(statement);
          successCount++;
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('Cannot drop') ||
              error.message.includes('There is already an object')) {
            skipCount++;
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    
    // Step 5: Verify tables were created
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('\n📋 Tables in TF_genie database:');
    tablesResult.recordset.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.TABLE_NAME}`);
    });
    
    // Step 6: Verify default users
    const usersResult = await pool.request().query('SELECT email, name, role FROM users');
    console.log('\n👥 Default users:');
    usersResult.recordset.forEach(user => {
      console.log(`   📧 ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend server: npm run server');
    console.log('   2. Start the frontend: npm run dev');
    console.log('   3. Login with: admin@tradefi.com / password');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Ensure SQL Server is running on DESKTOP-LQDEBH0');
    console.error('2. Verify TCP/IP is enabled in SQL Server Configuration Manager');
    console.error('3. Check that SQL Server Browser service is running');
    console.error('4. Ensure Windows Firewall allows connections on port 1433');
    console.error('5. Verify Mixed Mode authentication is enabled');
    console.error('6. Check that the sa account is enabled with correct password');
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Run the setup
setupSqlServerDatabase()
  .then(() => {
    console.log('\n✅ Setup script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup script failed:', error.message);
    process.exit(1);
  });