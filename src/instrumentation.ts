export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // eslint-disable-next-line no-console
    console.log("SEEDING");

    const { seed } = await import("./seeder");

    await seed();

    // eslint-disable-next-line no-console
    console.log("SEEDED");
  }
}
