require('dotenv').config();const app=require('./app');const connectDatabase=require('./config/database');
async function start(options={}){await connectDatabase(options.uri||process.env.MONGODB_URI);return new Promise((resolve,reject)=>{const server=app.listen(options.port??Number(process.env.PORT||5051),()=>resolve(server));server.once('error',reject);});}
if(require.main===module)start().then(server=>console.log(`BloodCare API listening on http://localhost:${server.address().port}`)).catch(async()=>{console.error('API startup failed. Check database connectivity and the configured port.');await require('mongoose').disconnect();process.exitCode=1;});
module.exports=start;
