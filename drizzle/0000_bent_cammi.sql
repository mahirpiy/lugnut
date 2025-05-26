CREATE TABLE "account" (
	"userId" serial NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "fuel_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" serial NOT NULL,
	"date" timestamp NOT NULL,
	"odometer_id" serial NOT NULL,
	"gallons" numeric(8, 3) NOT NULL,
	"total_cost" numeric(10, 2),
	"gas_station" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "fuel_entries_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "job_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"job_id" serial NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "job_photos_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" serial NOT NULL,
	"title" text NOT NULL,
	"date" timestamp NOT NULL,
	"odometer_id" serial NOT NULL,
	"labor_cost" numeric(10, 2) DEFAULT '0.00',
	"is_diy" boolean DEFAULT true,
	"difficulty" integer DEFAULT 0,
	"shop_name" text,
	"notes" text,
	"url" text,
	"hours" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "jobs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "odometer_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" text DEFAULT 'reading' NOT NULL,
	"vehicle_id" serial NOT NULL,
	"odometer" integer NOT NULL,
	"notes" text,
	"entry_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "odometer_entries_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "part_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"part_id" serial NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "part_photos_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"record_id" serial NOT NULL,
	"name" text NOT NULL,
	"part_number" text,
	"manufacturer" text,
	"cost" numeric(10, 2) DEFAULT '0.00',
	"quantity" integer DEFAULT 1 NOT NULL,
	"url" text,
	CONSTRAINT "parts_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "record_tags" (
	"record_id" serial NOT NULL,
	"tag_id" serial NOT NULL,
	CONSTRAINT "record_tags_record_id_tag_id_pk" PRIMARY KEY("record_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"job_id" serial NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "records_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tags_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"is_paid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" serial NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"license_plate" text,
	"vin" text,
	"nickname" text,
	"initial_odometer" integer NOT NULL,
	"current_odometer" integer NOT NULL,
	"registration_expiration" timestamp,
	"purchase_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicles_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fuel_entries" ADD CONSTRAINT "fuel_entries_odometer_id_odometer_entries_id_fk" FOREIGN KEY ("odometer_id") REFERENCES "public"."odometer_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_odometer_id_odometer_entries_id_fk" FOREIGN KEY ("odometer_id") REFERENCES "public"."odometer_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odometer_entries" ADD CONSTRAINT "odometer_entries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "part_photos" ADD CONSTRAINT "part_photos_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_record_id_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_record_id_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_tags" ADD CONSTRAINT "record_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "records" ADD CONSTRAINT "records_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;