-- CreateEnum
CREATE TYPE "OperationalStatus" AS ENUM ('NORMAL', 'REDUCED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ZoneStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CROWD_CONTROL', 'TRAFFIC_DIVERSION', 'RESOURCE_DEPLOYMENT', 'EMERGENCY_ALERT', 'INFRASTRUCTURE_CHECK');

-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'ZONE_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'NODAL_OFFICER';

-- AlterTable
ALTER TABLE "zones" ADD COLUMN     "health_index" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "nodal_officer_id" TEXT,
ADD COLUMN     "status" "ZoneStatus" NOT NULL DEFAULT 'GREEN';

-- CreateTable
CREATE TABLE "weather_logs" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition" TEXT NOT NULL,
    "temperature" DECIMAL(5,2) NOT NULL,
    "rainfall_mm" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "wind_speed_kmph" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "visibility_meters" DECIMAL(10,2) NOT NULL DEFAULT 10000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_operational_status" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "OperationalStatus" NOT NULL DEFAULT 'NORMAL',
    "base_capacity" INTEGER NOT NULL,
    "effective_capacity" INTEGER NOT NULL,
    "admin_decision_notes" TEXT,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_operational_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "poll_option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_orders" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "assigned_to_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "type" "ActionType" NOT NULL,
    "priority" "ActionPriority" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationLat" DECIMAL(10,8),
    "locationLng" DECIMAL(11,8),
    "expires_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "proof_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weather_logs_destination_id_timestamp_idx" ON "weather_logs"("destination_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "daily_operational_status_date_idx" ON "daily_operational_status"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_operational_status_destination_id_date_key" ON "daily_operational_status"("destination_id", "date");

-- CreateIndex
CREATE INDEX "polls_destination_id_idx" ON "polls"("destination_id");

-- CreateIndex
CREATE INDEX "poll_options_poll_id_idx" ON "poll_options"("poll_id");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_poll_id_user_id_key" ON "poll_votes"("poll_id", "user_id");

-- CreateIndex
CREATE INDEX "action_orders_zone_id_idx" ON "action_orders"("zone_id");

-- CreateIndex
CREATE INDEX "action_orders_assigned_to_id_idx" ON "action_orders"("assigned_to_id");

-- CreateIndex
CREATE INDEX "action_orders_status_idx" ON "action_orders"("status");

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_nodal_officer_id_fkey" FOREIGN KEY ("nodal_officer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_logs" ADD CONSTRAINT "weather_logs_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_operational_status" ADD CONSTRAINT "daily_operational_status_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_operational_status" ADD CONSTRAINT "daily_operational_status_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_option_id_fkey" FOREIGN KEY ("poll_option_id") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_orders" ADD CONSTRAINT "action_orders_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_orders" ADD CONSTRAINT "action_orders_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_orders" ADD CONSTRAINT "action_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
