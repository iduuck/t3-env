// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  BAZ: z.string(),
  FOO: z.preprocess((x) => {
    if (typeof x === "string") {
      return x.length;
    } else {
      return 0;
    }
  }, z.number()),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_BAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  BAZ: process.env.BAZ,
  FOO: process.env.FOO,
  NEXT_PUBLIC_BAR: process.env.NEXT_PUBLIC_BAR,
};

// Don't touch the part below
// --------------------------

const formatErrors = (
  /** @type {z.ZodFormattedError<Map<string,string>,string>} */
  errors
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

const merged = server.merge(client);
const parsed =
  typeof window === "undefined"
    ? merged.safeParse(processEnv)
    : client.safeParse(processEnv);
if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:\n",
    ...formatErrors(parsed.error.format())
  );
  throw new Error("Invalid environment variables");
}

console.log('parsed data', parsed.data)

/**
 * This is a rough draft, that can be optimized.
 */
const envHandler = {
  get(target, prop) {
    const schema = server.pick({ [prop]: true });
    const result = schema.safeParse({ [prop]: target[prop] });

    console.log(result)

    if (result.success) {
      return target[prop];
    } else {
      console.error(
        "You tried to access an environment variable, that is only available on the server."
      );
      return undefined;
    }
  },
};

const environmentProxy = new Proxy(parsed.data, envHandler)

/** @type z.infer<merged>
 * @ts-ignore - technically lying here */
export default environmentProxy
