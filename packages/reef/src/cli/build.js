import { buildAll } from "../core/builder.js";
import { cleanupTempDir, setupCleanupOnExit } from "../utils/tempDir.js";

process.env.NODE_ENV = "production";

setupCleanupOnExit();
cleanupTempDir();
await buildAll({ verbose: true });
