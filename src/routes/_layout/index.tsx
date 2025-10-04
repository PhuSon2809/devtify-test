import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/pages";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});
