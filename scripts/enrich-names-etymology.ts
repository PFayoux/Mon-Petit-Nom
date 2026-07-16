#!/usr/bin/env node

/**
 * One-time (re-runnable) enrichment pass: for every name in src/data/names.ts,
 * fetch its French Wiktionary etymology text, extract origin language /
 * religion / country via a Claude Haiku batch job, and rewrite names.ts with
 * the results. See docs/adr/0008-name-origin-metadata-via-llm-batch.md.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/enrich-names-etymology.ts [--limit=20]
 *
 * --limit=N processes only the first N names still missing all three origin
 * fields — use it to validate output quality before running the full batch.
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

import { NAMES } from '../src/data/names';
import type { Name } from '../src/types/name';

const NAMES_FILE = path.join(__dirname, '../src/data/names.ts');
const WIKTIONARY_USER_AGENT = 'MonPetitNom/1.0 (contact: paul.fayoux@gmail.com)';
const WIKTIONARY_CONCURRENCY = 5;
const MODEL = 'claude-haiku-4-5';

const ORIGIN_SCHEMA = {
  type: 'object' as const,
  properties: {
    originLanguage: {
      anyOf: [{ type: 'string' as const }, { type: 'null' as const }],
      description:
        "Langue(s) d'origine du prénom mentionnée(s) dans le texte (ex: 'latin', 'hébreu ancien', 'grec ancien'), ou null si aucune langue n'est mentionnée.",
    },
    originReligion: {
      anyOf: [{ type: 'string' as const }, { type: 'null' as const }],
      description:
        "Tradition religieuse explicitement associée au prénom dans le texte (ex: 'christianisme', 'judaïsme', 'islam'), ou null si le texte n'en mentionne pas.",
    },
    originCountry: {
      anyOf: [{ type: 'string' as const }, { type: 'null' as const }],
      description:
        "Pays ou région précis d'origine si le texte en mentionne un (distinct d'une simple langue), ou null sinon.",
    },
  },
  required: ['originLanguage', 'originReligion', 'originCountry'],
  additionalProperties: false,
};

type OriginFields = {
  originLanguage: string | null;
  originReligion: string | null;
  originCountry: string | null;
};

const EMPTY_ORIGIN: OriginFields = {
  originLanguage: null,
  originReligion: null,
  originCountry: null,
};

async function fetchEtymology(name: string): Promise<string | null> {
  const url = `https://fr.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(
    name
  )}&prop=extracts&explaintext=1&format=json&formatversion=2`;
  const response = await fetch(url, { headers: { 'User-Agent': WIKTIONARY_USER_AGENT } });
  if (!response.ok) return null;
  const data = await response.json();
  const extract: string | undefined = data?.query?.pages?.[0]?.extract;
  if (!extract) return null;

  const match = extract.match(/^=+\s*Étymologie\s*=+$/m);
  if (!match) return null;
  const start = match.index! + match[0].length;
  const rest = extract.slice(start);
  const nextHeading = rest.search(/^=+.*=+$/m);
  const section = (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
  return section.length > 0 ? section : null;
}

async function fetchAllEtymologies(names: readonly string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  let cursor = 0;

  async function worker() {
    while (cursor < names.length) {
      const index = cursor++;
      const name = names[index];
      const etymology = await fetchEtymology(name);
      if (etymology) result.set(name, etymology);
      if ((index + 1) % 100 === 0) console.log(`Wiktionnaire: ${index + 1}/${names.length}`);
    }
  }

  await Promise.all(Array.from({ length: WIKTIONARY_CONCURRENCY }, worker));
  return result;
}

async function runBatch(
  client: Anthropic,
  etymologies: Map<string, string>
): Promise<Map<string, OriginFields>> {
  const requests = Array.from(etymologies.entries()).map(([name, etymology]) => ({
    custom_id: name,
    params: {
      model: MODEL,
      max_tokens: 512,
      system:
        "Tu extrais des informations factuelles à partir d'un texte d'étymologie de prénom en français. N'invente rien : si une information n'est pas explicitement présente dans le texte, renvoie null pour ce champ.",
      messages: [{ role: 'user' as const, content: etymology }],
      output_config: { format: { type: 'json_schema' as const, schema: ORIGIN_SCHEMA } },
    },
  }));

  console.log(`Envoi du batch Claude (${requests.length} requêtes)...`);
  const batch = await client.messages.batches.create({ requests });
  console.log(`Batch ${batch.id} créé, en attente...`);

  let current = batch;
  while (current.processing_status !== 'ended') {
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    current = await client.messages.batches.retrieve(batch.id);
    console.log(`Statut: ${current.processing_status}`, current.request_counts);
  }

  const results = new Map<string, OriginFields>();
  for await (const entry of await client.messages.batches.results(batch.id)) {
    if (entry.result.type !== 'succeeded') {
      console.warn(`Échec pour "${entry.custom_id}": ${entry.result.type}`);
      continue;
    }
    const block = entry.result.message.content.find(
      (b: { type: string }) => b.type === 'text'
    );
    if (!block || block.type !== 'text') continue;
    try {
      results.set(entry.custom_id, JSON.parse(block.text));
    } catch {
      console.warn(`JSON invalide pour "${entry.custom_id}"`);
    }
  }
  return results;
}

function serializeNames(entries: readonly Name[]): string {
  const lines = entries.map((entry) => {
    const fields = [
      `name: ${JSON.stringify(entry.name)}`,
      `gender: ${JSON.stringify(entry.gender)}`,
      `boyCount: ${entry.boyCount}`,
      `girlCount: ${entry.girlCount}`,
      `originLanguage: ${JSON.stringify(entry.originLanguage)}`,
      `originReligion: ${JSON.stringify(entry.originReligion)}`,
      `originCountry: ${JSON.stringify(entry.originCountry)}`,
    ];
    return `  { ${fields.join(', ')} },`;
  });

  const header = fs
    .readFileSync(NAMES_FILE, 'utf8')
    .split('export const NAMES')[0];

  return `${header}export const NAMES: readonly Name[] = [\n${lines.join('\n')}\n];\n`;
}

async function main() {
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined;

  const pending = NAMES.filter(
    (entry) =>
      entry.originLanguage === null && entry.originReligion === null && entry.originCountry === null
  );
  const targets = limit ? pending.slice(0, limit) : pending;

  if (targets.length === 0) {
    console.log('Rien à enrichir — tous les prénoms ont déjà des champs origin renseignés (ou tentés).');
    return;
  }

  console.log(`Récupération des étymologies Wiktionnaire pour ${targets.length} prénoms...`);
  const etymologies = await fetchAllEtymologies(targets.map((entry) => entry.name));
  console.log(`Étymologie trouvée pour ${etymologies.size}/${targets.length} prénoms.`);

  if (etymologies.size === 0) {
    console.log('Aucune étymologie trouvée, rien à envoyer à Claude.');
    return;
  }

  const client = new Anthropic();
  const origins = await runBatch(client, etymologies);

  const targetNames = new Set(targets.map((entry) => entry.name));
  const merged: Name[] = NAMES.map((entry) => {
    if (!targetNames.has(entry.name)) return entry;
    return { ...entry, ...(origins.get(entry.name) ?? EMPTY_ORIGIN) };
  });

  fs.writeFileSync(NAMES_FILE, serializeNames(merged));
  console.log(`Terminé — ${origins.size} prénoms enrichis, ${NAMES_FILE} réécrit.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
