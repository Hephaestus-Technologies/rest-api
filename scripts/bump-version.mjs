import fs from "fs";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const templatePath = path.join(__dirname, "../package.json");
const outputPath = path.join(__dirname, "../.bin/package.json");

const json = JSON.parse(fs.readFileSync(templatePath).toString());
json.version = process.env.version.slice(1);
fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
