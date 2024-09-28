import { HydrateClient } from "~/trpc/server";
import HomePage from "~/components/HomePage";

export default async function Home() {
  return (
    <HydrateClient>
      <HomePage />
    </HydrateClient>
  );
}
