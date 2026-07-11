import { requireRole } from "@/server/require-session";
import { listCategoriesWithModifierGroups } from "@/server/services/modifier-service";
import { ModifierManager } from "@/components/pengaturan/modifier-manager";

export default async function ModifierSettingsPage() {
  const user = await requireRole(["OWNER"]);
  const categories = await listCategoriesWithModifierGroups(user.tenantId);

  return (
    <ModifierManager
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        modifierGroups: category.modifierGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          required: group.required,
          options: group.options.map((option) => ({
            id: option.id,
            name: option.name,
            priceDelta: option.priceDelta,
          })),
        })),
      }))}
    />
  );
}
