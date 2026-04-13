import { buildClient } from "@datocms/cma-client-node";
import { readFileSync } from "fs";

// Accept token as CLI arg or fall back to .env
const token = process.argv[2] || (() => {
  const env = Object.fromEntries(
    readFileSync(".env", "utf-8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => {
        const [k, ...v] = l.split("=");
        return [k.trim(), v.join("=").trim()];
      })
  );
  return env.DATO_API_KEY;
})();

console.log(`Using token: ${token.slice(0, 6)}...${token.slice(-4)}`);

const client = buildClient({ apiToken: token });

const COPIES = [
  { from: "directors_page", to: "directors_page_feit" },
  { from: "work", to: "work_feit" },
];

async function getModelByApiKey(apiKey) {
  const models = await client.itemTypes.list();
  return models.find((m) => m.api_key === apiKey);
}

async function getFieldsForModel(modelId) {
  return client.fields.list(modelId);
}

// Recursively strip `id` from block/nested objects so DatoCMS creates fresh ones
function stripBlockIds(value) {
  if (Array.isArray(value)) {
    return value.map(stripBlockIds);
  }
  if (value && typeof value === "object") {
    const cleaned = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "id") continue; // strip block id
      cleaned[k] = stripBlockIds(v);
    }
    return cleaned;
  }
  return value;
}

async function duplicateRecords(fromApiKey, toApiKey) {
  const fromModel = await getModelByApiKey(fromApiKey);
  const toModel = await getModelByApiKey(toApiKey);

  if (!fromModel) throw new Error(`Model "${fromApiKey}" not found`);
  if (!toModel) throw new Error(`Model "${toApiKey}" not found`);

  const fromFields = await getFieldsForModel(fromModel.id);
  const toFields = await getFieldsForModel(toModel.id);

  const toFieldApiKeys = new Set(toFields.map((f) => f.api_key));

  // Build a set of block/modular-content field api_keys so we know which to strip ids from
  const blockFieldApiKeys = new Set(
    fromFields
      .filter((f) => ["rich_text", "modular_content", "structured_text"].includes(f.field_type))
      .map((f) => f.api_key)
  );

  // Get all records from source model
  const records = await client.items.list({
    filter: { type: fromModel.id },
    version: "current",
    nested: true,
  });

  console.log(
    `Found ${records.length} record(s) in "${fromApiKey}", copying to "${toApiKey}"...`
  );

  for (const record of records) {
    // Build field values - only copy fields that exist on the target model
    const fieldValues = {};
    for (const field of fromFields) {
      if (toFieldApiKeys.has(field.api_key) && record[field.api_key] !== undefined) {
        let value = record[field.api_key];
        // Strip ids from block fields so DatoCMS creates new blocks
        if (blockFieldApiKeys.has(field.api_key)) {
          value = stripBlockIds(value);
        }
        fieldValues[field.api_key] = value;
      }
    }

    try {
      const created = await client.items.create({
        item_type: { type: "item_type", id: toModel.id },
        ...fieldValues,
      });
      console.log(`  Created record ${created.id} in "${toApiKey}"`);
    } catch (err) {
      console.error(`  Failed to create record:`, err.message);
      if (err.errors) console.error("  Details:", JSON.stringify(err.errors, null, 2));
    }
  }
}

async function main() {
  for (const { from, to } of COPIES) {
    await duplicateRecords(from, to);
  }
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
