import { z } from "zod";

export const appointmentRequestSchema = z.object({
  categorySlug: z.string().min(1, "La catégorie est requise."),
  firstName: z.string().trim().min(2, "Le prénom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  email: z.string().trim().email("Veuillez saisir un email valide."),
  phone: z.string().trim().min(8, "Le téléphone est requis."),
  message: z.string().trim().max(800, "Le message est trop long.").optional().or(z.literal("")),
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
    appointmentMode: z.enum(["telephone", "physique", "visioconference"]),
    description: z.string().trim().min(10, "La description est requise."),
    isOnline: z.boolean(),
    customMessage: z.string().trim().max(500).optional().or(z.literal("")),
    thumbnailImageDataUrl: z.string().trim().max(5_000_000).optional().or(z.literal("")),
    bannerImageDataUrl: z.string().trim().max(8_000_000).optional().or(z.literal("")),
    startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de debut est requise."),
    endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "L'heure de fin est requise."),
  })
  .refine((data) => data.startTime < data.endTime, {
    path: ["endTime"],
    message: "L'heure de fin doit etre posterieure a l'heure de debut.",
  });

export const settingsSchema = z
  .object({
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().trim(),
    maintenanceAllowedIps: z.string().trim().max(2000, "La liste des IP autorisées est trop longue."),
    enableWhatsappWidget: z.boolean(),
    globalBlackoutPeriods: z
      .array(
        z
          .object({
            startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de début est requise."),
            endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de fin est requise."),
            message: z.string().trim().max(300, "La raison publique est trop longue.").optional().or(z.literal("")),
          })
          .refine((data) => data.startDate <= data.endDate, {
            path: ["endDate"],
            message: "La date de fin doit être postérieure ou égale à la date de début.",
          }),
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
