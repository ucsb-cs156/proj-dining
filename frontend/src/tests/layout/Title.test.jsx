/* global global */
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

beforeAll(() => {
  const html = fs.readFileSync(path.resolve("./index.html"), "utf-8");
  const dom = new JSDOM(html);
  global.document = dom.window.document;
  global.window = dom.window;
});

test("index.html has correct title", async () => {
  expect(document.title).toBe("UCSB Dining");
});
