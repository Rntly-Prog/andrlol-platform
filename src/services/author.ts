import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { AuthorData, DEFAULT_AUTHOR } from '../constants/author';

const AUTHOR_SETTING_KEY = 'author';

function parseAuthor(value: unknown): AuthorData | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Partial<AuthorData>;
  if (!data.name || !data.fullName || !data.description) return null;
  return {
    ...DEFAULT_AUTHOR,
    ...data,
    stats: { ...DEFAULT_AUTHOR.stats, ...data.stats },
    skills: Array.isArray(data.skills) ? data.skills : DEFAULT_AUTHOR.skills,
    games: Array.isArray(data.games) ? data.games : DEFAULT_AUTHOR.games,
    services: Array.isArray(data.services) ? data.services : DEFAULT_AUTHOR.services,
    contacts: {
      ...DEFAULT_AUTHOR.contacts,
      ...data.contacts,
      discord: {
        ...DEFAULT_AUTHOR.contacts.discord,
        ...data.contacts?.discord,
      },
    },
  };
}

export async function getAuthorData(): Promise<AuthorData> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: AUTHOR_SETTING_KEY },
  });

  return parseAuthor(setting?.value) ?? DEFAULT_AUTHOR;
}

export async function saveAuthorData(data: AuthorData): Promise<AuthorData> {
  const value = data as unknown as Prisma.InputJsonValue;

  await prisma.siteSetting.upsert({
    where: { key: AUTHOR_SETTING_KEY },
    create: {
      key: AUTHOR_SETTING_KEY,
      value,
    },
    update: {
      value,
    },
  });

  return data;
}

export function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function authorFromForm(body: Record<string, string>): AuthorData {
  return {
    name: body.name?.trim() || DEFAULT_AUTHOR.name,
    fullName: body.fullName?.trim() || DEFAULT_AUTHOR.fullName,
    age: Number.parseInt(body.age, 10) || DEFAULT_AUTHOR.age,
    tagline: body.tagline?.trim() || DEFAULT_AUTHOR.tagline,
    description: body.description?.trim() || DEFAULT_AUTHOR.description,
    photo: body.photo?.trim() || DEFAULT_AUTHOR.photo,
    location: body.location?.trim() || DEFAULT_AUTHOR.location,
    experience: body.experience?.trim() || DEFAULT_AUTHOR.experience,
    stats: {
      builds: body.statsBuilds?.trim() || DEFAULT_AUTHOR.stats.builds,
      guides: body.statsGuides?.trim() || DEFAULT_AUTHOR.stats.guides,
      games: body.statsGames?.trim() || DEFAULT_AUTHOR.stats.games,
    },
    skills: parseLines(body.skills || ''),
    games: parseLines(body.gamesList || ''),
    services: parseLines(body.services || ''),
    contacts: {
      discord: {
        username: body.discordUsername?.trim() || DEFAULT_AUTHOR.contacts.discord.username,
        server: body.discordServer?.trim() || DEFAULT_AUTHOR.contacts.discord.server,
      },
      telegram: body.telegram?.trim() || DEFAULT_AUTHOR.contacts.telegram,
    },
  };
}
