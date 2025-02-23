import Together from "together-ai";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const together = new Together({ apiKey: process.env.TOGETHER_KEY });

// Запрос к API DeepSeek
async function aiResponse(filepath) {
  console.log(`Comment ${filepath}`);
  const fileContent = await fs.readFile(filepath, "utf-8");

  const sys_prompt = `You are a professional analyst, your goal is to analyze the code and leave comments for JSDoc. 
  Your goal is to provide concise and direct answers without additional explanations. 
  You input only JavaScript file, your goal is to comment on it.  
  Give only JavaScript code in answer, WITHOUT '''javascript ... '''!
  Leave comments for the file in JSDoc format so that it is clear to the average person and the average user can later comfortably read the documentation created using JSDoc. 
  Make clear and simple examples if them needed.`;

  const response = await together.chat.completions.create({
    messages: [
      {
        role: "system",
        content: sys_prompt,
      },
      {
        role: "user",
        content: fileContent,
      },
    ],
    model: "deepseek-ai/DeepSeek-V3",
    max_tokens: null,
    timeout: 90000000,
    temperature: 0.1,
  });

  const response_answer = response.choices[0].message.content;
  // await fs.writeFile("./log-last", response_answer, "utf-8");
  const data = response_answer.trim();
  await fs.writeFile(filepath, data, "utf-8");
  console.log(`Comment ${filepath} was successful!`);
}

// Асинхронное добавление комментариев к файлам
async function makeComments(files) {
  try {
    const promises = files.map((file) => aiResponse(file));
    await Promise.allSettled(promises);
  } catch (err) {
    console.error("ОШИБКА", err);
  }
}

// Считывание файлов в массив для тестов
async function readFiles(dirpath) {
  let files = await fs.readdir(dirpath);
  for (let i = 0; i < files.length; i++) {
    files[i] = path.join(dirpath, files[i]);
  }
  return files;
}

const files = await readFiles("./test-js/");
makeComments(files);
