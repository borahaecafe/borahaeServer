-- CreateEnum
CREATE TYPE "role" AS ENUM ('administrator', 'vendor');

-- CreateEnum
CREATE TYPE "productStatus" AS ENUM ('approved', 'rejected', 'waiting');

-- CreateEnum
CREATE TYPE "requestStatus" AS ENUM ('waiting', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "notificationStatus" AS ENUM ('read', 'unread');

-- CreateEnum
CREATE TYPE "orderStatus" AS ENUM ('refund', 'approved', 'declined');

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "logs" (
    "logsID" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userID" TEXT,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("logsID")
);

-- CreateTable
CREATE TABLE "company" (
    "companyID" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("companyID")
);

-- CreateTable
CREATE TABLE "address" (
    "addressID" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "companyID" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("addressID")
);

-- CreateTable
CREATE TABLE "profile" (
    "profileID" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "userID" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profileID")
);

-- CreateTable
CREATE TABLE "notification" (
    "notificationID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notificationStatus" "notificationStatus" NOT NULL DEFAULT 'unread',
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userID" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notificationID")
);

-- CreateTable
CREATE TABLE "product" (
    "productID" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "status" "productStatus" NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP NOT NULL,
    "notificationID" TEXT,

    CONSTRAINT "product_pkey" PRIMARY KEY ("productID")
);

-- CreateTable
CREATE TABLE "order" (
    "orderID" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "companyID" TEXT NOT NULL,
    "payment" TEXT NOT NULL,
    "status" "orderStatus" NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userID" TEXT NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("orderID")
);

-- CreateTable
CREATE TABLE "request" (
    "requestID" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "quantity" INTEGER,
    "status" "requestStatus" NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP NOT NULL,
    "userID" TEXT NOT NULL,
    "notificationID" TEXT,

    CONSTRAINT "request_pkey" PRIMARY KEY ("requestID")
);

-- CreateTable
CREATE TABLE "otp" (
    "otID" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "expiredAt" TIMESTAMP NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("otID")
);

-- CreateTable
CREATE TABLE "_companyToproduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_productTorequest" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_orderToproduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "otp_otp_key" ON "otp"("otp");

-- CreateIndex
CREATE UNIQUE INDEX "_companyToproduct_AB_unique" ON "_companyToproduct"("A", "B");

-- CreateIndex
CREATE INDEX "_companyToproduct_B_index" ON "_companyToproduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_productTorequest_AB_unique" ON "_productTorequest"("A", "B");

-- CreateIndex
CREATE INDEX "_productTorequest_B_index" ON "_productTorequest"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_orderToproduct_AB_unique" ON "_orderToproduct"("A", "B");

-- CreateIndex
CREATE INDEX "_orderToproduct_B_index" ON "_orderToproduct"("B");

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_companyID_fkey" FOREIGN KEY ("companyID") REFERENCES "company"("companyID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_notificationID_fkey" FOREIGN KEY ("notificationID") REFERENCES "notification"("notificationID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_companyID_fkey" FOREIGN KEY ("companyID") REFERENCES "company"("companyID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_notificationID_fkey" FOREIGN KEY ("notificationID") REFERENCES "notification"("notificationID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_companyToproduct" ADD CONSTRAINT "_companyToproduct_A_fkey" FOREIGN KEY ("A") REFERENCES "company"("companyID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_companyToproduct" ADD CONSTRAINT "_companyToproduct_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("productID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_productTorequest" ADD CONSTRAINT "_productTorequest_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("productID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_productTorequest" ADD CONSTRAINT "_productTorequest_B_fkey" FOREIGN KEY ("B") REFERENCES "request"("requestID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_orderToproduct" ADD CONSTRAINT "_orderToproduct_A_fkey" FOREIGN KEY ("A") REFERENCES "order"("orderID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_orderToproduct" ADD CONSTRAINT "_orderToproduct_B_fkey" FOREIGN KEY ("B") REFERENCES "product"("productID") ON DELETE CASCADE ON UPDATE CASCADE;
