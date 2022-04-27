// https://rich.pythonlang.cn/en/stable/padding.html
import { Code } from "./styling/code";
import { Text } from "./styling/text";
import { Html } from "./styling/html";
import { Image } from "./styling/image";
import { Markdown } from "./styling/markdown";
import { Table } from "./layout/table";

export const sil = {
  Code,
  Text,
  Html,
  Image,
  Table,
  Markdown,
  code: (code: string) => new Code(code),
  text: (text: string) => new Text(text),
};

export const sillage = sil;
export type Sillage = typeof sil;
export { Console } from "./console";
