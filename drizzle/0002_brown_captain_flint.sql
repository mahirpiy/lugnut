ALTER TABLE "tags" DROP CONSTRAINT "tags_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "is_preset";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "user_id";