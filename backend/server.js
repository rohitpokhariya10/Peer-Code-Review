import "dotenv/config";
import app from "./src/app.js";
import connectDb from "./src/config/database.js";

const port = process.env.PORT || 3000;

// Connect to Database
connectDb();

// Start Server
app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});