import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";

import route from "./routes";
import connect from "../src/config/db";

dotenv.config();
connect();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

route(app);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
