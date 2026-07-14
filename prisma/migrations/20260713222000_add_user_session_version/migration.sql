-- Server-side session revocation counter. JWTs embed this value at sign-in and
-- are rejected when an account's authentication state changes.
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
