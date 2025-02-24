import Together from "together-ai";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const yellow = "\x1b[33m"; // Жёлтый цвет
const green = "\x1b[32m"; // Зелёный цвет
const reset = "\x1b[0m"; // Сброс цвета
const red = "\x1b[31m"; // Красный цвет

const together = new Together({ apiKey: process.env.TOGETHER_KEY });

// Function to split a large file into smaller chunks without breaking functions or classes
async function splitFile(filepath, maxLines = 250) {
  const fileContent = await fs.readFile(filepath, "utf-8");
  const lines = fileContent.split("\n");
  const chunks = [];
  let currentChunk = [];
  let openBraces = 0;

  for (let line of lines) {
    currentChunk.push(line);
    openBraces += (line.match(/{/g) || []).length;
    openBraces -= (line.match(/}/g) || []).length;

    if (currentChunk.length >= maxLines && openBraces === 0) {
      chunks.push(currentChunk.join("\n"));
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n"));
  }

  return chunks;
}

// Function to process a large file by splitting it into chunks and processing each chunk
async function processLargeFile(filepath) {
  const chunks = await splitFile(filepath);
  const processedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const tempFilePath = `${filepath}.chunk${i}`;
    try {
      await fs.writeFile(tempFilePath, chunk, "utf-8");
      console.log(`Processing chunk ${i}...`);
      const processedChunk = await processChunk(tempFilePath);
      processedChunks.push(processedChunk);
      console.log(`Chunk ${i} processed.`);
    } catch (err) {
      console.error(`Error processing chunk ${i}: ${err.message}`);
    } finally {
      await deleteTempFile(tempFilePath);
    }
  }

  const reassembledContent = processedChunks.join("\n");
  await fs.writeFile(filepath, reassembledContent, "utf-8");
  console.log(`File ${filepath} reassembled.`);
}

// Function to delete a temporary file
async function deleteTempFile(tempFilePath) {
  try {
    await fs.unlink(tempFilePath);
    console.log(`Temp file ${tempFilePath} deleted.`);
  } catch (err) {
    console.error(`Error deleting temp file ${tempFilePath}: ${err.message}`);
  }
}

// Function to process a chunk of code and add JSDoc comments using Together AI
async function processChunk(filepath) {
  const fileContent = await fs.readFile(filepath, "utf-8");

  const sys_prompt = `You are a professional analyst, your goal is to analyze the code and leave comments for JSDoc. 
  Your goal is to provide concise and direct answers without additional explanations. 
  You input only JavaScript file, your goal is to comment on it.  
  Give only JavaScript code in answer, WITHOUT '''javascript ... '''!
  Leave comments for the file in JSDoc format so that it is clear to the average person and the average user can later comfortably read the documentation created using JSDoc. 
  Make clear and simple examples if them needed.`;

  const response = await together.chat.completions.create({
    messages: [
      { role: "system", content: sys_prompt },
      { role: "user", content: fileContent },
    ],
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    max_tokens: null,
    timeout: null,
    temperature: 0.1,
  });

  let response_answer = response.choices[0].message.content;
  response_answer = cleanResponse(response_answer);

  await fs.writeFile("./log-last", response_answer, "utf-8");
  return response_answer.trim();
}

// Function to clean the response from Together AI
function cleanResponse(response) {
  const lines = response.split("\n");
  if (lines[0].trim() === "```javascript") {
    lines.shift();
  }
  if (lines[lines.length - 1].trim() === "```") {
    lines.pop();
  }
  return lines.join("\n");
}

// Function to handle AI response for a file
async function aiResponse(filepath) {
  const fileContent = await fs.readFile(filepath, "utf-8");
  const lines = fileContent.split("\n").length;
  const maxLines = 250;

  if (lines > maxLines) {
    await processLargeFile(filepath);
  } else {
    const data = await processChunk(filepath);
    await fs.writeFile(filepath, data, "utf-8");
  }
}

// Function to delay execution for a given number of milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to add comments to a batch of files
async function makeComments(files) {
  let index = 0;

  while (index < files.length) {
    const batch = files.slice(index, index + 6);

    const promises = batch.map(async (file) => {
      try {
        process.stdout.write(`${yellow}Comment ${file}${reset}\n`);
        await aiResponse(file);
        process.stdout.write(`${green}Comments added to ${file}${reset}\n`);
      } catch (err) {
        process.stdout.write(
          `${red}Error: ${err.message || err.code} for file: ${file}${reset}\n`
        );
      }
    });

    await Promise.allSettled(promises);

    index += 6;
    if (index < files.length) {
      console.log(`${yellow}Waiting for rate limit...${reset}`);
      await delay(60 * 1000);
    }
  }
}

// Function to get all files in a directory recursively
async function getAllFiles(dirpath) {
  let files = [];
  const items = await fs.readdir(dirpath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirpath, item.name);
    if (item.isDirectory()) {
      const nestedFiles = await getAllFiles(fullPath);
      files = files.concat(nestedFiles);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

const files = await getAllFiles("./test-js/");
makeComments(files);
