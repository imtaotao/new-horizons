import fs from "node:fs";
import minimist from "minimist";
import { replace } from "esbuild-plugin-replace";

const argv = minimist<{ watch: boolean }>(process.argv.slice(2));

const formatMap = {
  cjs: ".cjs",
  iife: ".global.js",
  esm: [".js", ".mjs"],
};

const pkg = JSON.parse(
  fs.readFileSync(new URL("./package.json", import.meta.url)).toString(),
);

const banner =
  "/*!\n" +
  ` * ${pkg.name}.js v${pkg.version}\n` +
  ` * (c) 2025-${new Date().getFullYear()} imtaotao\n` +
  " */";

const outputConfigs: Array<{ format: string; extname: string }> = [];

for (const format of ["cjs", "esm", "iife"]) {
  let extname = formatMap[format];
  if (!Array.isArray(extname)) extname = [extname];
  for (const ext of extname) {
    outputConfigs.push({ format, extname: ext });
  }
}

const globalName = pkg.name
  .replace(/@/g, "")
  .split(/[\/-]/g)
  .map((l: string) => l[0].toUpperCase() + l.slice(1))
  .join("");

export const tsup = outputConfigs
  .filter(({ extname }) => (argv.watch ? /^\.(c?)js/.test(extname) : true))
  .map(({ format, extname }) => ({
    format,
    globalName,
    dts: true,
    treeshake: true,
    clean: !argv.watch,
    sourcemap: argv.watch,
    entry: ["src/index.ts"],
    watch: argv.watch ? "src" : false,
    banner: {
      js: banner.trim(),
    },
    outExtension: () => ({
      js: extname,
    }),
    define: {
      __TEST__: "false",
      __VERSION__: `'${pkg.version}'`,
    },
    esbuildPlugins: [
      replace({
        __DEV__:
          '(typeof process !== "undefined" ? (process.env?.NODE_ENV !== "production") : false)',
      }),
    ],
  }));
