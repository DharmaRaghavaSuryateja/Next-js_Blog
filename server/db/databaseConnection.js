const mongoose=require("mongoose");
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to DB");
}).catch((err)=>console.log("Unable to connect to database",err));
