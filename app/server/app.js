import express from "express";
// import todoRouter from "./router/todo.js";
const app = express();

app.use(express.json());

// app.use("/todos", todoRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong." });
});

// Setting for deployment by render
const port = process.env.PORT || 8080;
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});
