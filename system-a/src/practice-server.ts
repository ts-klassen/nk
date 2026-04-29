import express, {
  type ErrorRequestHandler,
  type Request,
  type Response
} from "express";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const helloAllowedMethods = "GET, HEAD, POST, OPTIONS";

app.use(express.json());

app.options("/hello", (_req: Request, res: Response) => {
  res.set("Allow", helloAllowedMethods).status(204).send();
});

app.get("/hello", (_req: Request, res: Response) => {
  res.json({
    message: "hello"
  });
});

app.post("/hello", (_req: Request, res: Response) => {
  res.status(201).json({
    message: "created"
  });
});

app.patch("/hello", (_req: Request, res: Response) => {
  res.set("Allow", helloAllowedMethods).status(405).json({
    error: {
      code: "METHOD_NOT_ALLOWED",
      message: "このメソッドは使えません"
    }
  });
});

app.get("/echo-query", (req: Request, res: Response) => {
  const word = typeof req.query.word === "string" ? req.query.word : "";

  res.json({
    word
  });
});

app.get("/hello/:name", (req: Request, res: Response) => {
  res.json({
    message: `hello, ${req.params.name}`
  });
});

app.post("/echo-body", (req: Request, res: Response) => {
  const bodyValue =
    req.body !== null && typeof req.body === "object"
      ? (req.body as { name?: unknown })
      : {};
  const name = typeof bodyValue.name === "string" ? bodyValue.name : "";

  res.json({
    name,
    message: name === "" ? "hello" : `hello, ${name}`
  });
});

const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "JSON の形が不正です"
      }
    });
    return;
  }

  next(err);
};

app.use(jsonErrorHandler);

app.listen(port, () => {
  console.log(`Practice server listening on http://127.0.0.1:${port}`);
});
