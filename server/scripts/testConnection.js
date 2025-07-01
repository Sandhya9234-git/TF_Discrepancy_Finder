import { testConnection } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🚀 Testing SQL Server Database Connection...');
console.log('📋 Configuration:');
console.log(`   Server: ${process.env.DB_SERVER}`);
console.log(`   Database: ${process.env.DB_DATABASE}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Port: ${process.env.DB_PORT || 1433}`);
console.log(`   Encrypt: ${process.env.DB_ENCRYPT}`);
console.log(`   Trust Certificate: ${process.env.DB_TRUST_SERVER_CERTIFICATE}`);
console.log('');

testConnection()
  .then((success) => {
    if (success) {
      console.log('✅ Connection test completed successfully!');
      console.log('🎉 Your application should now be able to connect to the database.');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Run: npm run create-db (to set up database schema)');
      console.log('   2. Run: npm run server (to start backend)');
      console.log('   3. Run: npm run dev (to start frontend)');
    } else {
      console.log('❌ Connection test failed!');
      console.log('🔧 Please check:');
      console.log('   1. SQL Server is running on DESKTOP-LQDEBH0');
      console.log('   2. TCP/IP is enabled in SQL Server Configuration Manager');
      console.log('   3. SQL Server Browser service is running');
      console.log('   4. Windows Firewall allows connections on port 1433');
      console.log('   5. Mixed mode authentication is enabled');
      console.log('   6. The sa account is enabled and password is correct');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Connection test error:', error.message);
    console.log('');
    console.log('🔧 Common solutions:');
    console.log('   1. Enable TCP/IP in SQL Server Configuration Manager');
    console.log('   2. Restart SQL Server service after enabling TCP/IP');
    console.log('   3. Check Windows Firewall settings');
    console.log('   4. Verify SQL Server is listening on port 1433');
    console.log('   5. Enable SQL Server Authentication (Mixed Mode)');
    process.exit(1);
  });