import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const sourceFiles = [
  "css/reset.css",
  "css/variables.css",
  "css/layout.css",
  "css/components.css",
  "css/sections.css",
  "css/wizard.css",
];

const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();

const build = async () => {
  const contents = await Promise.all(
    sourceFiles.map((file) => fs.readFile(path.join(rootDir, file), "utf8"))
  );
  const bundled = contents.join("\n");
  const output = minifyCss(bundled);

  await fs.writeFile(path.join(rootDir, "css/app.min.css"), `${output}\n`, "utf8");
  console.log(`Built css/app.min.css from ${sourceFiles.length} files`);
};

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
