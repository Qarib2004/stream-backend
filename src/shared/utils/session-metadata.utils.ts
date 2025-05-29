import type { Request } from "express";
import type { SessionMetadata } from "../types/session-metadata.types";
import DeviceDetector = require("device-detector-js");
import { lookup } from "geoip-lite";
import { IS_DEV_ENV } from "./is-dev.util";
import * as countries from 'i18n-iso-countries'

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export function getSessionMetadata(req: Request, userAgent: string): SessionMetadata {
  const ip =
    IS_DEV_ENV
      ? ""
      : Array.isArray(req.headers["cf-connecting-ip"])
      ? req.headers["cf-connecting-ip"][0]
      : req.headers["cf-connecting-ip"] ||
        (typeof req.headers["x-forwarded-for"] === "string"
          ? req.headers["x-forwarded-for"].split(",")[0]
          : req.ip);

  const location = lookup(ip || "");

  const device = new DeviceDetector().parse(userAgent);

  return {
    location: {
      country: countries.getName(location?.country ?? '','en') || "unknown",
      city: location?.city || "unknown",
      latitude: location?.ll?.[0] || 0,
      longitude: location?.ll?.[1] || 0,
    },
    device: {
      browser: device.client?.name || "unknown",
      os: device.os?.name || "unknown",
      type: device.device?.type || "unknown",
    },
    ip,
  };
}
