import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import feedRouter from "./routes/feedsRoutes";
import commentRouter from "./routes/commentsRoutes";
import path from "path";
import { notFound, errorHandler } from "./utils";
import { startScheduledTasks } from "./controllers/feedsController";
// import cookieSession from 'cookie-session'

dotenv.config();

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRouter);
app.use("/api/feeds", feedRouter);
app.use("/api/comments", commentRouter);

startScheduledTasks();

// app.use(express.static(path.join(__dirname, "/frontend")))

// app.get("*", (req, res) =>
//   res.sendFile(
//     path.join(__dirname, "/frontend/dist/index.html")
//   )
// )

// app.use(express.static(path.join(__dirname, "build"))); // put this line of code in app.js

app.use(notFound);
app.use(errorHandler);

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).send({ message: err.message });
});

app.listen(port, () => {
  console.log(`server at http://localhost:5000`);
});
