import mongoose from 'mongoose'

const connectDb = async ()=>{
    const url = process.env.MONGO_URL;

    if(!url){
        throw new Error("Mongo url not found in environment variables");
    }

    try{
        await mongoose.connect(url,{
            dbName:"Chat-app-database"
        });
        console.log("connected successfully");
    }
    catch(err){
        console.error("failed to connect to the database");
        process.exit(1);
    }
}

export default connectDb;