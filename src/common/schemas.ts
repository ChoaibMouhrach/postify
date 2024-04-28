import { z } from "zod";

export const pageSchema = z.union([
  z.string().transform((page) => parseInt(page) || 1),
  z.array(z.string()).transform((pages) => parseInt(pages[0]) || 1),
  z.undefined().transform(() => 1),
]);

export const trashSchema = z.union([
  z.undefined().transform(() => false),
  z.string().transform((v) => v === "true"),
  z.array(z.string()).transform((vs) => vs[0] === "true"),
]);

export const querySchema = z.union([
  z.undefined().transform(() => ""),
  z.string(),
  z.array(z.string()).transform((vs) => vs[0]),
]);

export const fromSchema = z.union([
  z.undefined(),
  z.literal("").transform(() => undefined),
  z.string(),
]);

export const toSchema = z.union([
  z.undefined(),
  z.literal("").transform(() => undefined),
  z.string(),
]);
