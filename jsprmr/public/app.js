const DIFFICULTIES = ["basic", "standard", "advanced"];
const DIFFICULTY_LABELS = {
  basic: "基本",
  standard: "標準",
  advanced: "応用"
};
const DIFFICULTY_POINTS = {
  basic: 4,
  standard: 2,
  advanced: 1
};
const ALLOWED_CONSTRUCTORS = {
  Date,
  Map,
  Set
};

const elements = {
  problemForm: document.querySelector("#problem-form"),
  unitSelect: document.querySelector("#unit-select"),
  setSelect: document.querySelector("#set-select"),
  difficultyButtons: Array.from(document.querySelectorAll("[data-difficulty]")),
  totalScore: document.querySelector("#total-score"),
  scoreBasic: document.querySelector("#score-basic"),
  scoreStandard: document.querySelector("#score-standard"),
  scoreAdvanced: document.querySelector("#score-advanced"),
  problemHeading: document.querySelector("#problem-heading"),
  loadStatus: document.querySelector("#load-status"),
  problemMarkdown: document.querySelector("#problem-markdown"),
  runSummary: document.querySelector("#run-summary"),
  codeInput: document.querySelector("#code-input"),
  runButton: document.querySelector("#run-button"),
  saveButton: document.querySelector("#save-button"),
  saveStatus: document.querySelector("#save-status"),
  caseList: document.querySelector("#case-list")
};

const state = {
  unitNumber: "03",
  setIndex: "",
  difficulty: "basic",
  unitNames: {},
  problems: new Map(),
  results: new Map(),
  loadToken: null,
  setListToken: null,
  savedCode: "",
  isLoading: false,
  isSaving: false,
  isRunning: false,
  canRun: false
};

const UNSAVED_CHANGES_MESSAGE = "未保存の変更があります。保存せずに切り替えますか？";

class ProblemDefinitionError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProblemDefinitionError";
  }
}

function initializeUnitSelect() {
  elements.unitSelect.innerHTML = "";

  const unitNumbers = Object.keys(state.unitNames).length > 0
    ? Object.keys(state.unitNames).sort()
    : Array.from({ length: 28 }, (_, index) => String(index + 3).padStart(2, "0"));

  for (const unitNumber of unitNumbers) {
    const option = document.createElement("option");
    option.value = unitNumber;
    option.textContent = getUnitLabel(unitNumber);
    elements.unitSelect.append(option);
  }

  elements.unitSelect.value = state.unitNumber;
}

function getUnitLabel(unitNumber = state.unitNumber) {
  const unitName = state.unitNames[unitNumber];
  return unitName ? `${unitNumber} ${unitName}` : unitNumber;
}

async function loadUnitNames() {
  try {
    const unitNames = await fetchJson("/units.json");
    state.unitNames = isPlainObject(unitNames) ? unitNames : {};
  } catch {
    state.unitNames = {};
  }
}

function getProblemKey(unitNumber = state.unitNumber, setIndex = state.setIndex, difficulty = state.difficulty) {
  return `${unitNumber}/${setIndex}/${difficulty}`;
}

function getSubmissionTarget() {
  return {
    unitNumber: state.unitNumber,
    setIndex: state.setIndex,
    difficulty: state.difficulty
  };
}

function isCurrentTarget(target) {
  return (
    target.unitNumber === state.unitNumber &&
    target.setIndex === state.setIndex &&
    target.difficulty === state.difficulty
  );
}

function hasUnsavedChanges() {
  return elements.codeInput.value !== state.savedCode;
}

function confirmDiscardUnsavedChanges() {
  return !hasUnsavedChanges() || window.confirm(UNSAVED_CHANGES_MESSAGE);
}

function setDifficulty(difficulty) {
  if (state.difficulty === difficulty) {
    return;
  }

  if (!confirmDiscardUnsavedChanges()) {
    return;
  }

  state.difficulty = difficulty;

  for (const button of elements.difficultyButtons) {
    button.setAttribute("aria-selected", String(button.dataset.difficulty === difficulty));
  }

  renderScore();
  loadCurrentProblem();
}

function renderScore() {
  let total = 0;

  for (const difficulty of DIFFICULTIES) {
    const result = state.results.get(getProblemKey(state.unitNumber, state.setIndex, difficulty));
    const scoreElement = elements[`score${capitalize(difficulty)}`];

    if (!result) {
      scoreElement.textContent = "未実行";
      continue;
    }

    const points = result.passed ? DIFFICULTY_POINTS[difficulty] : 0;
    total += points;
    scoreElement.textContent = `${points}点`;
  }

  elements.totalScore.value = String(total);
}

function capitalize(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchJsonOrNull(url) {
  const response = await fetch(url, { cache: "no-store" });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

function updateRunButtonState() {
  elements.runButton.disabled = state.isRunning || !state.canRun;
}

function updateCodeInputState() {
  elements.codeInput.disabled = state.isLoading || state.isSaving;
}

function updateSaveButtonState() {
  const hasSelection = Boolean(state.setIndex);
  const hasDiff = hasUnsavedChanges();
  elements.saveButton.disabled = state.isSaving || !hasSelection || !hasDiff;
}

function clearCodeInput() {
  elements.codeInput.value = "";
  state.savedCode = "";
  updateSaveButtonState();
}

function renderProblemUnavailable(message, statusText = "") {
  state.canRun = false;
  updateRunButtonState();
  elements.problemHeading.textContent = "課題";
  elements.problemMarkdown.textContent = "";
  elements.caseList.innerHTML = "";
  elements.caseList.append(createEmptyState(message));
  elements.loadStatus.textContent = statusText;
  renderScore();
}

function renderProblemSetOptions(sets, preferredSetIndex) {
  elements.setSelect.innerHTML = "";

  if (sets.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "なし";
    elements.setSelect.append(option);
    elements.setSelect.value = "";
    elements.setSelect.disabled = true;
    state.setIndex = "";
    return;
  }

  const selectedSet = sets.includes(preferredSetIndex) ? preferredSetIndex : sets[0];

  for (const setIndex of sets) {
    const option = document.createElement("option");
    option.value = setIndex;
    option.textContent = setIndex;
    elements.setSelect.append(option);
  }

  elements.setSelect.value = selectedSet;
  elements.setSelect.disabled = false;
  state.setIndex = selectedSet;
}

async function loadProblemSets(preferredSetIndex = state.setIndex) {
  const unitNumber = state.unitNumber;
  const setListToken = Symbol("set-list");
  state.setListToken = setListToken;
  state.canRun = false;
  state.isLoading = true;
  elements.setSelect.disabled = true;
  elements.loadStatus.textContent = "課題セット読み込み中";
  elements.runSummary.textContent = "";
  elements.saveStatus.textContent = "";
  clearCodeInput();
  updateRunButtonState();
  updateCodeInputState();

  try {
    const data = await fetchJson(`/api/problem-sets/${unitNumber}`);

    if (state.setListToken !== setListToken || state.unitNumber !== unitNumber) {
      return;
    }

    const sets = Array.isArray(data.sets) ? data.sets : [];
    renderProblemSetOptions(sets, preferredSetIndex);

    if (!state.setIndex) {
      clearCodeInput();
      state.isLoading = false;
      updateCodeInputState();
      renderProblemUnavailable("課題セットがありません。", "課題セットなし");
      return;
    }

    await loadCurrentProblem();
  } catch (error) {
    if (state.setListToken !== setListToken || state.unitNumber !== unitNumber) {
      return;
    }

    renderProblemSetOptions([], "");
    clearCodeInput();
    state.isLoading = false;
    updateCodeInputState();
    renderProblemUnavailable("課題セットを読み込めません。", error.message);
  }
}

async function loadLatestSubmission(target) {
  const submission = await fetchJsonOrNull(
    `/api/submissions/${target.unitNumber}/${target.setIndex}/${target.difficulty}/latest`
  );

  if (!submission) {
    return "";
  }

  if (typeof submission.code !== "string") {
    throw new Error("invalid submission response");
  }

  return submission.code;
}

async function loadCurrentProblem() {
  if (!state.setIndex) {
    clearCodeInput();
    state.isLoading = false;
    updateCodeInputState();
    renderProblemUnavailable("課題セットがありません。", "課題セットなし");
    return;
  }

  const key = getProblemKey();
  const difficultyLabel = DIFFICULTY_LABELS[state.difficulty];
  const loadToken = Symbol("load");
  const target = getSubmissionTarget();
  state.loadToken = loadToken;
  state.canRun = false;
  state.isLoading = true;

  elements.loadStatus.textContent = "読み込み中";
  elements.runSummary.textContent = "";
  elements.saveStatus.textContent = "";
  clearCodeInput();
  updateRunButtonState();
  updateCodeInputState();

  const basePath = `/api/problems/${target.unitNumber}/${target.setIndex}/${target.difficulty}`;
  const problemPromise = Promise.all([
    fetchText(`${basePath}.md`),
    fetchJson(`${basePath}.json`)
  ])
    .then(([markdown, tests]) => ({ markdown, tests }))
    .catch((error) => ({ error }));
  const submissionPromise = loadLatestSubmission(target);
  const [problemResult, submissionResult] = await Promise.allSettled([
    problemPromise,
    submissionPromise
  ]);

  if (state.loadToken !== loadToken || !isCurrentTarget(target)) {
    return;
  }

  if (submissionResult.status === "fulfilled") {
    elements.codeInput.value = submissionResult.value;
    state.savedCode = submissionResult.value;
  } else {
    elements.codeInput.value = "";
    state.savedCode = "";
    elements.saveStatus.textContent = `保存コード読込失敗: ${submissionResult.reason.message}`;
  }

  updateSaveButtonState();

  const problem = problemResult.status === "fulfilled" ? problemResult.value : { error: problemResult.reason };
  state.problems.set(key, problem);

  if (problem.error) {
    state.isLoading = false;
    updateCodeInputState();
    renderProblemUnavailable(
      "課題ファイルが見つからないか、読み込めません。",
      problem.error.message
    );
    return;
  }

  const title = typeof problem.tests.title === "string" ? problem.tests.title : `${difficultyLabel}の課題`;
  elements.problemHeading.textContent = title;
  elements.problemMarkdown.textContent = problem.markdown;
  elements.loadStatus.textContent = `${getUnitLabel(target.unitNumber)} / 課題セット ${target.setIndex} / ${target.difficulty}`;
  state.canRun = true;
  state.isLoading = false;
  updateRunButtonState();
  updateCodeInputState();

  renderCases(problem.tests.cases, state.results.get(key)?.caseResults ?? []);
  renderScore();
}

function renderCases(cases, caseResults = []) {
  elements.caseList.innerHTML = "";

  if (!Array.isArray(cases) || cases.length === 0) {
    elements.caseList.append(createEmptyState("テストケースがありません。"));
    return;
  }

  cases.forEach((testCase, index) => {
    const article = document.createElement("article");
    article.className = "case-card";

    const heading = document.createElement("h3");
    heading.textContent = testCase.name || `ケース ${index + 1}`;
    article.append(heading);

    const meta = document.createElement("div");
    meta.className = "case-meta";
    meta.append(createCaseSpec("input", formatInputSpec(testCase.input)));
    meta.append(createCaseSpec("output", formatOutputSpec(testCase.output)));
    article.append(meta);

    article.append(createCaseResult(caseResults[index]));
    elements.caseList.append(article);
  });
}

function createCaseSpec(title, content) {
  const section = document.createElement("section");
  const heading = document.createElement("h4");
  const pre = document.createElement("pre");

  heading.textContent = title;
  pre.textContent = content;

  section.append(heading, pre);
  return section;
}

function createCaseResult(result) {
  const container = document.createElement("div");
  container.className = "case-result";

  const badge = document.createElement("span");
  badge.className = `badge ${result?.status ?? "pending"}`;
  badge.textContent = getResultLabel(result?.status);
  container.append(badge);

  if (result?.message) {
    const pre = document.createElement("pre");
    pre.textContent = result.message;
    container.append(pre);
  }

  return container;
}

function createEmptyState(message) {
  const paragraph = document.createElement("p");
  paragraph.className = "empty-state";
  paragraph.textContent = message;
  return paragraph;
}

function getResultLabel(status) {
  if (status === "passed") {
    return "成功";
  }

  if (status === "failed") {
    return "失敗";
  }

  if (status === "problem-error") {
    return "問題定義エラー";
  }

  return "未実行";
}

function formatInputSpec(inputSpec) {
  if (!inputSpec || typeof inputSpec !== "object") {
    return "(invalid input)";
  }

  if (inputSpec.type === "value") {
    return stringifyForDisplay(inputSpec.value);
  }

  if (inputSpec.type === "constructor") {
    const args = Array.isArray(inputSpec.args) ? inputSpec.args : [];
    return `new ${inputSpec.name}(${args.map((arg) => stringifyForDisplay(arg)).join(", ")})`;
  }

  if (inputSpec.type === "factory") {
    return String(inputSpec.factory ?? "");
  }

  return `(unknown input type: ${String(inputSpec.type)})`;
}

function formatOutputSpec(outputSpec) {
  if (!outputSpec || typeof outputSpec !== "object") {
    return "(invalid output)";
  }

  if (outputSpec.type === "value") {
    return stringifyForDisplay(outputSpec.value);
  }

  if (outputSpec.type === "evaluator") {
    return String(outputSpec.evaluator ?? "");
  }

  return `(unknown output type: ${String(outputSpec.type)})`;
}

function stringifyForDisplay(value) {
  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "function") {
    return value.toString();
  }

  try {
    const seen = new WeakSet();
    const json = JSON.stringify(
      value,
      (key, nestedValue) => {
        if (typeof nestedValue === "object" && nestedValue !== null) {
          if (seen.has(nestedValue)) {
            return "[Circular]";
          }
          seen.add(nestedValue);
        }
        return nestedValue;
      },
      2
    );

    return typeof json === "string" ? json : String(value);
  } catch {
    return String(value);
  }
}

async function runCurrentProblem() {
  const key = getProblemKey();
  const problem = state.problems.get(key);

  if (!problem || problem.error || !Array.isArray(problem.tests.cases)) {
    return;
  }

  const target = getSubmissionTarget();
  const code = elements.codeInput.value;

  state.isRunning = true;
  updateRunButtonState();
  elements.runSummary.textContent = "実行中";
  const savePromise = saveCurrentSubmission({ force: true, target, code });

  const caseResults = [];

  for (const testCase of problem.tests.cases) {
    const result = runSingleCase(testCase, code);
    caseResults.push(result);

    if (isCurrentTarget(target)) {
      renderCases(problem.tests.cases, caseResults);
    }

    await Promise.resolve();
  }

  const passed = caseResults.length > 0 && caseResults.every((result) => result.status === "passed");
  state.results.set(key, { passed, caseResults });

  if (isCurrentTarget(target)) {
    renderCases(problem.tests.cases, caseResults);
    renderScore();
    elements.runSummary.textContent = passed ? "全ケース成功" : "失敗あり";
  }

  await savePromise;

  state.isRunning = false;
  updateRunButtonState();
}

async function saveCurrentSubmission({
  force = false,
  target = getSubmissionTarget(),
  code = elements.codeInput.value
} = {}) {
  if (!target.setIndex) {
    return false;
  }

  if (!force && isCurrentTarget(target) && code === state.savedCode) {
    return true;
  }

  state.isSaving = true;
  updateSaveButtonState();
  updateCodeInputState();

  if (isCurrentTarget(target)) {
    elements.saveStatus.textContent = "保存中";
  }

  try {
    await saveSubmissionWithRetry(target, code);

    if (isCurrentTarget(target)) {
      state.savedCode = code;
      elements.saveStatus.textContent = "保存済み";
    }

    return true;
  } catch (error) {
    if (isCurrentTarget(target)) {
      elements.saveStatus.textContent = `保存失敗: ${error.message}`;
    }

    return false;
  } finally {
    state.isSaving = false;
    updateSaveButtonState();
    updateCodeInputState();
  }
}

async function saveSubmissionWithRetry(target, code) {
  let retryCount = 0;

  while (true) {
    const response = await fetch(
      `/api/submissions/${target.unitNumber}/${target.setIndex}/${target.difficulty}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      }
    );

    if (response.status === 201) {
      return;
    }

    if (response.status === 429) {
      retryCount += 1;
      if (isCurrentTarget(target)) {
        elements.saveStatus.textContent = `再送待ち ${retryCount}`;
      }
      await delay(1000);
      continue;
    }

    const detail = await response.text();
    throw new Error(`${response.status} ${detail}`);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function runSingleCase(testCase, code) {
  let executionInput;
  let originalInput;

  try {
    executionInput = createInput(testCase.input);

    if (testCase.output?.type === "evaluator") {
      originalInput = createInput(testCase.input);
    }
  } catch (error) {
    return {
      status: "problem-error",
      message: error.message
    };
  }

  let actualOutput;

  try {
    actualOutput = executeUserCode(code, executionInput);
  } catch (error) {
    return {
      status: "failed",
      message: `実行時エラー\n${formatError(error)}`
    };
  }

  try {
    const passed = evaluateOutput(testCase.output, actualOutput, originalInput);

    return {
      status: passed ? "passed" : "failed",
      message: `output:\n${stringifyForDisplay(actualOutput)}`
    };
  } catch (error) {
    if (error instanceof ProblemDefinitionError) {
      return {
        status: "problem-error",
        message: error.message
      };
    }

    return {
      status: "failed",
      message: `判定エラー\n${formatError(error)}`
    };
  }
}

function createInput(inputSpec) {
  if (!inputSpec || typeof inputSpec !== "object") {
    throw new ProblemDefinitionError("input must be an object");
  }

  if (inputSpec.type === "value") {
    return cloneJsonValue(inputSpec.value);
  }

  if (inputSpec.type === "constructor") {
    return createConstructorInput(inputSpec);
  }

  if (inputSpec.type === "factory") {
    return createFactoryInput(inputSpec);
  }

  throw new ProblemDefinitionError(`unknown input.type: ${String(inputSpec.type)}`);
}

function cloneJsonValue(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    throw new ProblemDefinitionError("value must be JSON serializable");
  }
}

function createConstructorInput(inputSpec) {
  const Constructor = ALLOWED_CONSTRUCTORS[inputSpec.name];

  if (typeof Constructor !== "function") {
    throw new ProblemDefinitionError(`constructor is not allowed: ${String(inputSpec.name)}`);
  }

  const args = inputSpec.args ?? [];

  if (!Array.isArray(args)) {
    throw new ProblemDefinitionError("input.args must be an array");
  }

  return new Constructor(...cloneJsonValue(args));
}

function createFactoryInput(inputSpec) {
  if (typeof inputSpec.factory !== "string") {
    throw new ProblemDefinitionError("input.factory must be a string");
  }

  let factory;

  try {
    factory = new Function(`return (${inputSpec.factory});`)();
  } catch (error) {
    throw new ProblemDefinitionError(`input.factory cannot be evaluated: ${formatError(error)}`);
  }

  if (typeof factory !== "function") {
    throw new ProblemDefinitionError("input.factory must evaluate to a function");
  }

  try {
    return factory();
  } catch (error) {
    throw new ProblemDefinitionError(`input.factory threw an error: ${formatError(error)}`);
  }
}

function executeUserCode(code, providedInput) {
  const execute = new Function(
    "providedInput",
    `
const input = providedInput;
let output;
${code}
return output;
`
  );

  return execute(providedInput);
}

function evaluateOutput(outputSpec, actualOutput, originalInput) {
  if (!outputSpec || typeof outputSpec !== "object") {
    throw new ProblemDefinitionError("output must be an object");
  }

  if (outputSpec.type === "value") {
    return deepEqualJsonValue(actualOutput, outputSpec.value);
  }

  if (outputSpec.type === "evaluator") {
    return evaluateWithFunction(outputSpec.evaluator, actualOutput, originalInput);
  }

  throw new ProblemDefinitionError(`unknown output.type: ${String(outputSpec.type)}`);
}

function evaluateWithFunction(evaluatorSource, actualOutput, originalInput) {
  if (typeof evaluatorSource !== "string") {
    return false;
  }

  let evaluator;

  try {
    evaluator = new Function(`return (${evaluatorSource});`)();
  } catch {
    return false;
  }

  if (typeof evaluator !== "function") {
    return false;
  }

  try {
    return evaluator(actualOutput, originalInput) === true;
  } catch {
    return false;
  }
}

function deepEqualJsonValue(actual, expected) {
  if (expected === null || typeof expected !== "object") {
    return Object.is(actual, expected);
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      return false;
    }

    return expected.every((expectedItem, index) => deepEqualJsonValue(actual[index], expectedItem));
  }

  if (!isPlainObject(actual)) {
    return false;
  }

  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();

  if (actualKeys.length !== expectedKeys.length) {
    return false;
  }

  for (let index = 0; index < expectedKeys.length; index += 1) {
    if (actualKeys[index] !== expectedKeys[index]) {
      return false;
    }
  }

  return expectedKeys.every((key) => deepEqualJsonValue(actual[key], expected[key]));
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function formatError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

elements.problemForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

elements.unitSelect.addEventListener("change", () => {
  const nextUnitNumber = elements.unitSelect.value;

  if (nextUnitNumber === state.unitNumber) {
    return;
  }

  if (!confirmDiscardUnsavedChanges()) {
    elements.unitSelect.value = state.unitNumber;
    return;
  }

  state.unitNumber = nextUnitNumber;
  renderScore();
  loadProblemSets(state.setIndex);
});

elements.setSelect.addEventListener("change", () => {
  const nextSetIndex = elements.setSelect.value;

  if (nextSetIndex === state.setIndex) {
    return;
  }

  if (!confirmDiscardUnsavedChanges()) {
    elements.setSelect.value = state.setIndex;
    return;
  }

  state.setIndex = nextSetIndex;
  renderScore();
  loadCurrentProblem();
});

for (const button of elements.difficultyButtons) {
  button.addEventListener("click", () => {
    setDifficulty(button.dataset.difficulty);
  });
}

elements.codeInput.addEventListener("input", () => {
  if (hasUnsavedChanges()) {
    elements.saveStatus.textContent = "未保存の変更";
  } else if (!state.isSaving) {
    elements.saveStatus.textContent = "";
  }

  updateSaveButtonState();
});

elements.saveButton.addEventListener("click", () => {
  saveCurrentSubmission();
});

elements.runButton.addEventListener("click", runCurrentProblem);

window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedChanges()) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});

async function initializeApp() {
  await loadUnitNames();
  initializeUnitSelect();
  loadProblemSets();
}

initializeApp();
