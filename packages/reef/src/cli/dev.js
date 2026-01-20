import { startDevServer } from "../dev/server.js";
import { cleanupTempDir, setupCleanupOnExit } from "../utils/tempDir.js";

setupCleanupOnExit();
cleanupTempDir();
await startDevServer();
