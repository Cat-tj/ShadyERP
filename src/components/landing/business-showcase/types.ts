import type { ComponentType } from "react";
import type { VerticalKey } from "@/lib/verticals";

export type ShowcaseMetric = {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type ShowcaseActivity = {
  title: string;
  detail: string;
  status: string;
  tone?: "success" | "warning" | "danger" | "info";
};

export type ShowcaseScreenProps = {
  density?: "comfortable" | "compact" | "dense";
};

export type ShowcaseDefinition = {
  key: VerticalKey;
  label: string;
  headline: string;
  description: string;
  density: ShowcaseScreenProps["density"];
  Screen: ComponentType<ShowcaseScreenProps>;
};
