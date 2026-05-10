import { PrismaClient } from "@prisma/client";

import { fallbackTeams } from "../lib/teams";

const prisma = new PrismaClient();

async function main() {
  for (const team of fallbackTeams) {
    await prisma.team.upsert({
      where: { slug: team.id },
      update: {
        name: team.name,
        work: team.work,
        winScore: team.winScore,
        likelihood: team.likelihood,
        image: team.image,
        team: team.team,
        color: team.color
      },
      create: {
        slug: team.id,
        name: team.name,
        work: team.work,
        winScore: team.winScore,
        likelihood: team.likelihood,
        image: team.image,
        team: team.team,
        color: team.color
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
