-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login42" TEXT NOT NULL,
    "username" TEXT,
    "avatar" TEXT,
    "mfaKey" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login42_key" ON "users"("login42");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
