import { z } from "zod";

export const appointmentRequestSchema = z.object({
  categorySlug: z.string().min(1, "La catégorie est requise."),
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  email: z.string().trim().email("Veuillez saisir un email valide."),
  phone: z.string().trim().min(8, "Le téléphone est requis."),
  message: z.string().trim().max(800, "Le message est trop long.").optional().or(z.literal("")),
  customFieldResponsesJson: z.string().optional().or(z.literal("")),
  startsAt: z.string().trim().min(10, "Le créneau sélectionné est invalide."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Veuillez saisir un email valide."),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule.")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial.");

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(2, "Le prénom est requis."),
    lastName: z.string().trim().min(2, "Le nom est requis."),
    email: z.string().trim().email("Veuillez saisir un email valide."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });

export const categoryAdminSchema = z
  .object({
    categoryId: z.string().trim().optional().or(z.literal("")),
    title: z.string().trim().min(3, "Le titre est requis."),
    slug: z.string().trim().min(3, "Le lien est requis."),
    durationMinutes: z.coerce.number().int().positive("La durée doit être positive."),
    appointmentMode: z.enum([
      "telephone",
      "physique",
      "visioconference",
      "discord",
    ]),
    description: z.string().trim().min(10, "La description est requise."),
    isOnline: z.boolean(),
    isHidden: z.boolean().optional(),
    isBookingBlocked: z.boolean().optional(),
    bookingBlockMessage: z.string().trim().max(500).optional().or(z.literal("")),
    customMessage: z.string().trim().max(500).optional().or(z.literal("")),
    thumbnailImageDataUrl: z.string().trim().max(5_000_000).optional().or(z.literal("")),
    bannerImageDataUrl: z.string().trim().max(8_000_000).optional().or(z.literal("")),
    customFieldsJson: z.string().optional().or(z.literal("")),
    availabilityRules: z
      .array(
        z
          .object({
            weekday: z.enum(["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]),
            enabled: z.boolean(),
            startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de début est requise."),
            endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de fin est requise."),
            breakStart: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de début de la pause est invalide.").optional().or(z.literal("")),
            breakEnd: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de fin de la pause est invalide.").optional().or(z.literal("")),
          })
          .superRefine((rule, ctx) => {
            if (!rule.enabled) {
              return;
            }

            if (rule.startTime >= rule.endTime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endTime"],
                message: "L'heure de fin doit être postérieure à l'heure de début.",
              });
            }

            const hasBreakStart = Boolean(rule.breakStart);
            const hasBreakEnd = Boolean(rule.breakEnd);

            if (hasBreakStart !== hasBreakEnd) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["breakEnd"],
                message: "Renseignez les deux heures de pause repas ou laissez les deux champs vides.",
              });
            }

            if (hasBreakStart && hasBreakEnd) {
              if (rule.breakStart! >= rule.breakEnd!) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ["breakEnd"],
                  message: "La fin de la pause repas doit être postérieure à son début.",
                });
              }

              if (rule.breakStart! <= rule.startTime || rule.breakEnd! >= rule.endTime) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ["breakStart"],
                  message: "La pause repas doit être comprise strictement entre l'heure de début et l'heure de fin.",
                });
              }
            }
          }),
      )
      .refine((rules) => rules.some((rule) => rule.enabled), {
        message: "Sélectionnez au moins un jour de disponibilité.",
      }),
  })
  ;

export const settingsSchema = z
  .object({
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().trim(),
    maintenanceAllowedIps: z.string().trim().max(2000, "La liste des IP autorisées est trop longue."),
    enableWhatsappWidget: z.boolean(),
    enableBlackoutMarquee: z.boolean().default(true),
    globalBlackoutPeriods: z
      .array(
        z
          .object({
            startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de début est requise."),
            startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de début est requise."),
            endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de fin est requise."),
            endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de fin est requise."),
            message: z.string().trim().max(300, "La raison publique est trop longue.").optional().or(z.literal("")),
          })
          .refine(
            (data) =>
              `${data.startDate}T${data.startTime}` <= `${data.endDate}T${data.endTime}`,
            {
              path: ["endTime"],
              message: "La fin de l'indisponibilité doit être postérieure ou égale au début.",
            },
          ),
      )
      .max(30, "Vous ne pouvez pas enregistrer plus de 30 périodes d'indisponibilité."),
  })
  .refine((data) => !data.maintenanceMode || data.maintenanceMessage.length >= 8, {
    path: ["maintenanceMessage"],
    message: "Le message de maintenance est requis.",
  });

export const adminAppointmentSchema = appointmentRequestSchema.extend({
  categorySlug: z.string().trim().min(1, "La catégorie est requise."),
  linkedUserId: z.string().trim().uuid("Le client sélectionné est invalide.").optional().or(z.literal("")),
  createClientAccount: z.boolean(),
  updateLinkedUserProfile: z.boolean(),
});

export const accountProfileSchema = z.object({
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  email: z.string().trim().email("Veuillez saisir un email valide."),
  phone: z.string().trim().min(8, "Le numéro de téléphone est requis."),
  avatarImageDataUrl: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });
