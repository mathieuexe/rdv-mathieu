import { getCategorySlots } from "@/lib/data-access";
import { isMaintenanceBypassedForHeaders } from "@/lib/maintenance";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const initialPayload = await getCategorySlots(slug);

  if (!initialPayload) {
    return Response.json({ error: "Catégorie introuvable." }, { status: 404 });
  }

  const bypassMaintenance = isMaintenanceBypassedForHeaders(request.headers, initialPayload.siteSettings);
  const payload = bypassMaintenance ? await getCategorySlots(slug, { bypassMaintenance: true }) : initialPayload;

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
