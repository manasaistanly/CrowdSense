-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DESTINATION_ADMIN', 'STAFF', 'ANALYST', 'COMMUNITY_REP', 'TOURIST');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('NATIONAL_PARK', 'HERITAGE_SITE', 'HILL_STATION', 'BEACH', 'WILDLIFE_SANCTUARY', 'CULTURAL_SITE', 'ECO_TOURISM', 'ADVENTURE_SPORT');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('ACTIVE', 'TEMPORARILY_CLOSED', 'MAINTENANCE', 'SEASONAL_CLOSED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('CORE_CONSERVATION', 'BUFFER_ZONE', 'GENERAL_USE', 'RESTRICTED_ACCESS', 'VIEWPOINT', 'TRAIL', 'CAMPING_AREA');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CapacityRuleType" AS ENUM ('SEASONAL', 'WEATHER_BASED', 'EVENT_BASED', 'TIME_OF_DAY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertLevel" AS ENUM ('NORMAL', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "EnvironmentalMetricType" AS ENUM ('AIR_QUALITY_INDEX', 'WATER_QUALITY', 'NOISE_LEVEL', 'WASTE_GENERATED', 'ENERGY_CONSUMPTION', 'CARBON_FOOTPRINT', 'BIODIVERSITY_INDEX', 'SOIL_QUALITY', 'VEGETATION_COVER');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('SUGGESTION', 'COMPLAINT', 'CONCERN', 'APPRECIATION', 'INCIDENT_REPORT');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('ENVIRONMENTAL', 'INFRASTRUCTURE', 'COMMUNITY_IMPACT', 'VISITOR_BEHAVIOR', 'SAFETY', 'REVENUE_DISTRIBUTION', 'OTHER');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'CAPACITY_ALERT', 'SYSTEM_ANNOUNCEMENT', 'FEEDBACK_RESPONSE', 'REMINDER');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TOURIST',
    "avatar_url" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destinations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "location_address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "destination_type" "DestinationType" NOT NULL,
    "max_daily_capacity" INTEGER NOT NULL,
    "current_capacity" INTEGER NOT NULL DEFAULT 0,
    "status" "DestinationStatus" NOT NULL DEFAULT 'ACTIVE',
    "images" JSONB,
    "amenities" JSONB,
    "guidelines" TEXT,
    "contact_info" JSONB,
    "opening_time" TEXT,
    "closing_time" TEXT,
    "operating_days" INTEGER[],
    "admin_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_capacity" INTEGER NOT NULL,
    "current_capacity" INTEGER NOT NULL DEFAULT 0,
    "zone_type" "ZoneType" NOT NULL,
    "is_restricted" BOOLEAN NOT NULL DEFAULT false,
    "requires_guide" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_reference" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "zone_id" TEXT,
    "visit_date" DATE NOT NULL,
    "time_slot" TEXT,
    "number_of_visitors" INTEGER NOT NULL DEFAULT 1,
    "visitor_details" JSONB,
    "base_price" DECIMAL(10,2) NOT NULL,
    "dynamic_price_adjustment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "qr_code" TEXT,
    "entry_time" TIMESTAMP(3),
    "exit_time" TIMESTAMP(3),
    "verified_by" TEXT,
    "special_requirements" TEXT,
    "cancellation_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacity_rules" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "rule_type" "CapacityRuleType" NOT NULL,
    "applicable_days" INTEGER[],
    "start_time" TEXT,
    "end_time" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "capacity_percentage" DECIMAL(5,2),
    "absolute_capacity" INTEGER,
    "conditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacity_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "peak_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "off_peak_multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "adult_price" DECIMAL(10,2),
    "child_price" DECIMAL(10,2),
    "senior_price" DECIMAL(10,2),
    "student_price" DECIMAL(10,2),
    "local_price" DECIMAL(10,2),
    "foreign_price" DECIMAL(10,2),
    "applicable_days" INTEGER[],
    "start_date" DATE,
    "end_date" DATE,
    "min_capacity_threshold" INTEGER,
    "max_capacity_threshold" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "realtime_capacity" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "zone_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "capacity_percentage" DECIMAL(5,2),
    "entries_count" INTEGER NOT NULL DEFAULT 0,
    "exits_count" INTEGER NOT NULL DEFAULT 0,
    "alert_level" "AlertLevel" NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "realtime_capacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_metrics" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "metric_date" DATE NOT NULL,
    "metric_type" "EnvironmentalMetricType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "threshold_min" DECIMAL(10,2),
    "threshold_max" DECIMAL(10,2),
    "is_within_threshold" BOOLEAN,
    "measurement_method" TEXT,
    "notes" TEXT,
    "recorded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "environmental_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_reports" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "report_date" DATE NOT NULL,
    "total_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "booking_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "additional_services_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_visitors" INTEGER NOT NULL DEFAULT 0,
    "local_visitors" INTEGER NOT NULL DEFAULT 0,
    "foreign_visitors" INTEGER NOT NULL DEFAULT 0,
    "community_share" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "conservation_fund" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "operational_costs" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_feedback" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback_type" "FeedbackType" NOT NULL,
    "category" "FeedbackCategory",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "status" "FeedbackStatus" NOT NULL DEFAULT 'SUBMITTED',
    "admin_response" TEXT,
    "responded_by" TEXT,
    "responded_at" TIMESTAMP(3),
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "attachments" JSONB,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "action_url" TEXT,
    "action_label" TEXT,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_slug_idx" ON "destinations"("slug");

-- CreateIndex
CREATE INDEX "destinations_destination_type_idx" ON "destinations"("destination_type");

-- CreateIndex
CREATE INDEX "destinations_status_idx" ON "destinations"("status");

-- CreateIndex
CREATE INDEX "zones_destination_id_idx" ON "zones"("destination_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_key" ON "bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_destination_id_idx" ON "bookings"("destination_id");

-- CreateIndex
CREATE INDEX "bookings_visit_date_idx" ON "bookings"("visit_date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_booking_reference_idx" ON "bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "capacity_rules_destination_id_idx" ON "capacity_rules"("destination_id");

-- CreateIndex
CREATE INDEX "pricing_rules_destination_id_idx" ON "pricing_rules"("destination_id");

-- CreateIndex
CREATE INDEX "realtime_capacity_destination_id_timestamp_idx" ON "realtime_capacity"("destination_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "realtime_capacity_created_at_idx" ON "realtime_capacity"("created_at");

-- CreateIndex
CREATE INDEX "environmental_metrics_destination_id_metric_date_idx" ON "environmental_metrics"("destination_id", "metric_date" DESC);

-- CreateIndex
CREATE INDEX "revenue_reports_destination_id_report_date_idx" ON "revenue_reports"("destination_id", "report_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "revenue_reports_destination_id_report_date_key" ON "revenue_reports"("destination_id", "report_date");

-- CreateIndex
CREATE INDEX "community_feedback_destination_id_idx" ON "community_feedback"("destination_id");

-- CreateIndex
CREATE INDEX "community_feedback_status_idx" ON "community_feedback"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "destinations" ADD CONSTRAINT "destinations_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacity_rules" ADD CONSTRAINT "capacity_rules_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "realtime_capacity" ADD CONSTRAINT "realtime_capacity_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "realtime_capacity" ADD CONSTRAINT "realtime_capacity_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_metrics" ADD CONSTRAINT "environmental_metrics_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_metrics" ADD CONSTRAINT "environmental_metrics_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revenue_reports" ADD CONSTRAINT "revenue_reports_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_feedback" ADD CONSTRAINT "community_feedback_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_feedback" ADD CONSTRAINT "community_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_feedback" ADD CONSTRAINT "community_feedback_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
