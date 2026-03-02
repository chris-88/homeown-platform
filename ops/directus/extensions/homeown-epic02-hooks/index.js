import { createHash } from "node:crypto";

const LOG_PREFIX = "[homeown][epic02-hooks]";
const EVENT_TYPE = "calc_results_presented";

function envBool(value, defaultValue) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return defaultValue;
}

function envInt(value, defaultValue) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function stripWrappingQuotes(value) {
  const str = String(value ?? "");
  return str.replace(/^['"]|['"]$/g, "");
}

function pickOutputsSummary(outputs) {
  if (!outputs || typeof outputs !== "object") return {};

  return {
    verdict_code: outputs.verdict_code ?? null,
    upfront_amount_needed_today_eur: outputs.upfront_amount_needed_today_eur ?? null,
    time_to_upfront_amount_months: outputs.time_to_upfront_amount_months ?? null,
    indicative_mortgage_amount_eur: outputs.indicative_mortgage_amount_eur ?? null,
    upfront_amount_percent_used: outputs.upfront_amount_percent_used ?? null,
  };
}

function computeSignature(calcVersion, outputsSummary) {
  const canonical = JSON.stringify({
    calc_version: calcVersion ?? null,
    outputs_summary: outputsSummary ?? {},
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function extractKeys(meta) {
  if (!meta || typeof meta !== "object") return [];
  if (Array.isArray(meta.keys)) return meta.keys;
  if (meta.key) return [meta.key];
  if (meta.keys) return [meta.keys];
  return [];
}

export default ({ action, schedule }, { services, env, database, logger, getSchema }) => {
  logger.info(`${LOG_PREFIX} loaded`);

  const { ItemsService } = services;

  const maybeEmitCalcResultsPresented = async (key) => {
    if (!key) return;
    const schema = await getSchema();

    const snapshots = new ItemsService("calculator_snapshots", {
      schema,
      accountability: { admin: true },
    });

    const events = new ItemsService("events", {
      schema,
      accountability: { admin: true },
    });

    const snapshot = await snapshots.readOne(key, {
      fields: [
        "anon_session_id",
        "calc_version",
        "outputs_json",
        "results_presented_signature",
      ],
    });

    const payload = {
      anon_session_id: snapshot?.anon_session_id ?? null,
      calc_version: snapshot?.calc_version ?? null,
      outputs_summary: pickOutputsSummary(snapshot?.outputs_json),
    };

    if (!payload.anon_session_id) return;

    const nextSignature = computeSignature(payload.calc_version, payload.outputs_summary);
    const previousSignature = snapshot?.results_presented_signature ?? null;

    if (previousSignature && previousSignature === nextSignature) return;

    await events.createOne({
      event_type: EVENT_TYPE,
      actor_role: "system",
      visibility: "staff",
      payload,
    });

    await snapshots.updateOne(
      key,
      { results_presented_signature: nextSignature },
      { emitEvents: false },
    );
  };

  action("items.create", async (meta) => {
    if (meta?.collection !== "calculator_snapshots") return;
    const keys = extractKeys(meta);
    for (const key of keys) {
      try {
        await maybeEmitCalcResultsPresented(key);
      } catch (error) {
        logger.error(error, `${LOG_PREFIX} create handler failed`);
      }
    }
  });

  action("items.update", async (meta) => {
    if (meta?.collection !== "calculator_snapshots") return;
    const keys = extractKeys(meta);
    for (const key of keys) {
      try {
        await maybeEmitCalcResultsPresented(key);
      } catch (error) {
        logger.error(error, `${LOG_PREFIX} update handler failed`);
      }
    }
  });

  const retentionEnabled = envBool(env.HOMEOWN_RETENTION_ENABLED, true);
  const retentionCron = stripWrappingQuotes(
    env.HOMEOWN_RETENTION_CRON || "0 3 * * *",
  );
  const retentionDays = envInt(env.HOMEOWN_RETENTION_DAYS, 30);

  if (!retentionEnabled) {
    logger.info(`${LOG_PREFIX} retention disabled`);
    return;
  }

  schedule(retentionCron, async () => {
    const days = Math.max(0, retentionDays);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const deletedCount = await database("calculator_snapshots")
      .whereNull("client_id")
      .andWhere(database.raw("COALESCE(date_updated, date_created) < ?", [cutoff]))
      .del();

    logger.info(
      {
        deletedCount,
        cutoff: cutoff.toISOString(),
        days,
      },
      `${LOG_PREFIX} retention run complete`,
    );
  });

  logger.info(
    {
      retentionCron,
      retentionDays,
    },
    `${LOG_PREFIX} retention scheduled`,
  );
};
