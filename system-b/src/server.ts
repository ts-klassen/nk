import express from "express";

const app = express();
const port = Number(process.env.PORT ?? "3001");

app.use(express.json());

app.use((_req, res) => {
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "サーバーエラーが発生しました"
    }
  });
});

app.listen(port, () => {
  console.log(`system-b starter listening on port ${port}`);
});
