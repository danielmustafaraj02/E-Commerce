-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReturnRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "userId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReturnRequest" ("createdAt", "id", "orderId", "reason", "status", "updatedAt", "userId") SELECT "createdAt", "id", "orderId", "reason", "status", "updatedAt", "userId" FROM "ReturnRequest";
DROP TABLE "ReturnRequest";
ALTER TABLE "new_ReturnRequest" RENAME TO "ReturnRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
