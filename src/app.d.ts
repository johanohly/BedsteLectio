// See https://kit.svelte.dev/docs/types#app

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			db: NodePgDatabase;
		}
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export { };
