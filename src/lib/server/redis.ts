import { REDIS_URL } from "$env/static/private";
import { Redis } from "ioredis";

export let redis: Redis | undefined = undefined
if (REDIS_URL !== undefined && REDIS_URL !== "") redis = new Redis(REDIS_URL)