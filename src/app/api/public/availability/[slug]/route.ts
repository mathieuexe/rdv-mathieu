import { getCategorySlots } from "@/lib/data-access";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const payload = await getCategorySlots(slug);

  if (!payload) {
    return Response.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  return Response.json({
    category: {
      slug: payload.category.slug,
      title: payload.category.title,
      durationMinutes: payload.category.durationMinutes,
      appointmentMode: payload.category.appointmentMode,
    },
    maintenance: payload.siteSettings.maintenanceMode,
    disabledReason: payload.category.customMessage ?? null,
    slots: payload.slots,
  });
}
