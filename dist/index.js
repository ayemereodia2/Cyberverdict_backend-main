"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const feedsRoutes_1 = __importDefault(require("./routes/feedsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
const utils_1 = require("./utils");
const feedsController_1 = require("./controllers/feedsController");
// import cookieSession from 'cookie-session'
dotenv_1.default.config();
const port = process.env.PORT || 5000;
mongoose_1.default
    .connect(process.env.MONGODB_URL)
    .then(() => {
    console.log("connected to db");
})
    .catch((err) => {
    console.log(err.message);
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use("/api/users", userRoutes_1.default);
app.use("/api/feeds", feedsRoutes_1.default);
app.use("/api/comments", commentsRoutes_1.default);
(0, feedsController_1.startScheduledTasks)();
// app.use(express.static(path.join(__dirname, "/frontend")))
// app.get("*", (req, res) =>
//   res.sendFile(
//     path.join(__dirname, "/frontend/dist/index.html")
//   )
// )
// app.use(express.static(path.join(__dirname, "build"))); // put this line of code in app.js
app.use(utils_1.notFound);
app.use(utils_1.errorHandler);
app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});
app.listen(port, () => {
    console.log(`server at http://localhost:5000`);
});
//# sourceMappingURL=index.js.map