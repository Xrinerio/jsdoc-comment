import { writeFile } from "fs";
import fs from "fs/promises";
import path from "path";

async function readFilesInFolder() {
  const folderpath = "./pref";
  const writepath = "./test-js";

  const files = await fs.readdir(folderpath);

  for (const file of files) {
    const filepath = path.join(folderpath, file);
    const writefilepath = path.join(writepath, file);
    const content = await fs.readFile(filepath, "utf-8");
    fs.writeFile(writefilepath, content, "utf-8");
  }
}

readFilesInFolder();
