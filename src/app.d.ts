// See https://kit.svelte.dev/docs/types#app

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Redis } from "ioredis";

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			db: NodePgDatabase;
			redis: Redis;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export { };
