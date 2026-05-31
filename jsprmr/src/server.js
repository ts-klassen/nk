import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIFFICULTIES = new Set(["basic", "standard", "advanced"]);
const VALID_UNIT_RE = /^(0[3-9]|[12][0-9]|30)$/;
const VALID_SET_RE = /^[1-9][0-9]*$/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const problemsDir = path.join(projectRoot, "problems");

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--submissions-dir") {
      options.submissionsDir = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--submissions-dir=")) {
      options.submissionsDir = arg.slice("--submissions-dir=".length);
      continue;
    }

    if (arg === "--port") {
      options.port = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--port=")) {
      options.port = arg.slice("--port=".length);
    }
  }

  return options;
}

function isValidUnitNumber(value) {
  return VALID_UNIT_RE.test(value);
}

function isValidSetIndex(value) {
  return VALID_SET_RE.test(value);
}

function isValidDifficulty(value) {
  return DIFFICULTIES.has(value);
}

function validateProblemParams(req, res) {
  const { unitNumber, setIndex } = req.params;

  if (!isValidUnitNumber(unitNumber) || !isValidSetIndex(setIndex)) {
    res.status(400).json({ error: "invalid problem parameters" });
    return null;
  }

  return { unitNumber, setIndex };
}

function validateSubmissionParams(req, res) {
  const { unitNumber, setIndex, difficulty } = req.params;

  if (
    !isValidUnitNumber(unitNumber) ||
    !isValidSetIndex(setIndex) ||
    !isValidDifficulty(difficulty)
  ) {
    res.status(400).json({ error: "invalid submission parameters" });
    return null;
  }

  return { unitNumber, setIndex, difficulty };
}

function parseProblemFileName(fileName) {
  const match = /^(basic|standard|advanced)\.(md|json)$/.exec(fileName);

  if (!match) {
    return null;
  }

  return {
    difficulty: match[1],
    extension: match[2]
  };
}

function parseSubmissionFileName(fileName) {
  const match = /^(basic|standard|advanced)-([0-9]+)\.js$/.exec(fileName);

  if (!match) {
    return null;
  }

  return {
    difficulty: match[1],
    timestamp: Number.parseInt(match[2], 10)
  };
}

function getProblemPath(unitNumber, setIndex, difficulty, extension) {
  return path.join(problemsDir, unitNumber, setIndex, `${difficulty}.${extension}`);
}

function getSubmissionPath(submissionsDir, unitNumber, setIndex, difficulty) {
  const timestamp = Math.floor(Date.now() / 1000);
  const filename = `${difficulty}-${timestamp}.js`;

  return path.join(submissionsDir, unitNumber, setIndex, filename);
}

async function listProblemSets(unitNumber) {
  const unitDir = path.join(problemsDir, unitNumber);

  try {
    const entries = await fs.readdir(unitDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory() && isValidSetIndex(entry.name))
      .map((entry) => entry.name)
      .sort((left, right) => Number.parseInt(left, 10) - Number.parseInt(right, 10));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function getLatestSubmission(submissionsDir, unitNumber, setIndex, difficulty) {
  const submissionDir = path.join(submissionsDir, unitNumber, setIndex);

  try {
    const entries = await fs.readdir(submissionDir, { withFileTypes: true });
    const latest = entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const parsed = parseSubmissionFileName(entry.name);

        if (!parsed || parsed.difficulty !== difficulty) {
          return null;
        }

        return {
          filename: entry.name,
          timestamp: parsed.timestamp
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.timestamp - left.timestamp || right.filename.localeCompare(left.filename))[0];

    if (!latest) {
      return null;
    }

    const filePath = path.join(submissionDir, latest.filename);
    const code = await fs.readFile(filePath, "utf8");

    return {
      code,
      filename: latest.filename,
      timestamp: latest.timestamp
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function saveSubmission(filePath, code) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const fileHandle = await fs.open(filePath, "wx");

  try {
    await fileHandle.writeFile(code, "utf8");
  } finally {
    await fileHandle.close();
  }
}

function createApp({ submissionsDir }) {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/problem-sets/:unitNumber", async (req, res) => {
    const { unitNumber } = req.params;

    if (!isValidUnitNumber(unitNumber)) {
      res.status(400).json({ error: "invalid unit number" });
      return;
    }

    try {
      const sets = await listProblemSets(unitNumber);
      res.status(200).json({ sets });
    } catch {
      res.status(500).json({ error: "failed to list problem sets" });
    }
  });

  app.get("/api/problems/:unitNumber/:setIndex/:fileName", async (req, res) => {
    const params = validateProblemParams(req, res);

    if (!params) {
      return;
    }

    const file = parseProblemFileName(req.params.fileName);

    if (!file) {
      res.status(400).json({ error: "invalid problem file name" });
      return;
    }

    const filePath = getProblemPath(
      params.unitNumber,
      params.setIndex,
      file.difficulty,
      file.extension
    );

    try {
      const content = await fs.readFile(filePath);

      if (file.extension === "md") {
        res.set("Content-Type", "text/markdown; charset=utf-8");
      } else {
        res.set("Content-Type", "application/json; charset=utf-8");
      }

      res.status(200).send(content);
    } catch (error) {
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "problem not found" });
        return;
      }

      res.status(500).json({ error: "failed to read problem" });
    }
  });

  app.get("/api/submissions/:unitNumber/:setIndex/:difficulty/latest", async (req, res) => {
    const params = validateSubmissionParams(req, res);

    if (!params) {
      return;
    }

    try {
      const submission = await getLatestSubmission(
        submissionsDir,
        params.unitNumber,
        params.setIndex,
        params.difficulty
      );

      if (!submission) {
        res.status(404).json({ error: "submission not found" });
        return;
      }

      res.set("Cache-Control", "no-store");
      res.status(200).json(submission);
    } catch {
      res.status(500).json({ error: "failed to read submission" });
    }
  });

  app.post("/api/submissions/:unitNumber/:setIndex/:difficulty", async (req, res) => {
    const params = validateSubmissionParams(req, res);

    if (!params) {
      return;
    }

    if (!req.body || typeof req.body.code !== "string") {
      res.status(400).json({ error: "code must be a string" });
      return;
    }

    const filePath = getSubmissionPath(
      submissionsDir,
      params.unitNumber,
      params.setIndex,
      params.difficulty
    );

    try {
      await saveSubmission(filePath, req.body.code);
      res.status(201).json({ status: "saved" });
    } catch (error) {
      if (error.code === "EEXIST") {
        res.status(429).json({ error: "submission already exists for this second" });
        return;
      }

      res.status(500).json({ error: "failed to save submission" });
    }
  });

  app.use(express.static(publicDir));

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && "body" in error) {
      res.status(400).json({ error: "invalid JSON body" });
      return;
    }

    next(error);
  });

  return app;
}

const args = parseArgs(process.argv.slice(2));

if (!args.submissionsDir) {
  console.error("Usage: node src/server.js --submissions-dir submissions [--port 3000]");
  process.exit(1);
}

const submissionsDir = path.resolve(process.cwd(), args.submissionsDir);
const portValue = args.port ?? process.env.PORT ?? "3000";
const port = Number.parseInt(portValue, 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid port: ${portValue}`);
  process.exit(1);
}

try {
  await fs.mkdir(submissionsDir, { recursive: true });
} catch (error) {
  console.error(`Failed to create submissions directory: ${submissionsDir}`);
  console.error(error.message);
  process.exit(1);
}

const app = createApp({ submissionsDir });

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
  console.log(`Submissions directory: ${submissionsDir}`);
});
