import { createClient } from "redis";

const globalForRedis = globalThis;

export const redisClient =
    globalForRedis.redis ||
    createClient({
        socket: {
            host: process.env.REDIS_HOST || "redis",
            port: 6379,
        },
        password: process.env.REDIS_PASSWORD,
    });

if (!globalForRedis.redis) {
    globalForRedis.redis = redisClient;
}


redisClient.on("connect", () => {
    console.log("Redis connected");
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redisClient.on("error", (err) => {
    console.error("Redis Error", err);
});

// Connect once
if (!redisClient.isOpen) {
    redisClient.connect().catch(console.error);
}