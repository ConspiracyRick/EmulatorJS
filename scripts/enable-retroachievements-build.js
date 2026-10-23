#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const makefilePath = process.argv[2];
if (!makefilePath) {
    console.error("Usage: node enable-retroachievements-build.js /path/to/RetroArch/Makefile.emulatorjs");
    process.exit(2);
}

const resolvedPath = path.resolve(makefilePath);
if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
    console.error("RetroArch Makefile.emulatorjs was not found:", resolvedPath);
    process.exit(2);
}

const original = fs.readFileSync(resolvedPath, "utf8");
if (/^HAVE_CHEEVOS\s*[:?+]?=/m.test(original)) {
    console.log("HAVE_CHEEVOS is already configured; no change made.");
    process.exit(0);
}

const anchor = /^HAVE_CHEATS = 1\s*$/m;
if (!anchor.test(original)) {
    console.error("Could not find the expected HAVE_CHEATS = 1 setting. The RetroArch build file may have changed.");
    process.exit(1);
}

const updated = original.replace(anchor, "HAVE_CHEATS = 1\nHAVE_CHEEVOS ?= 1");
fs.writeFileSync(resolvedPath, updated, "utf8");
console.log("Enabled RetroAchievements (HAVE_CHEEVOS=1) in:", resolvedPath);
console.log("Rebuild the RetroArch WebAssembly runtime and all core archives after applying this change.");
