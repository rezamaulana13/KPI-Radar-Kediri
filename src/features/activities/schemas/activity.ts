import { z } from "zod";

export const ACTIVITY_TYPES = ["oplah", "profiling", "program", "penawaran", "progress", "hasil"] as const;

export const activitySchema = z
  .object({
    owner_id: z.string().uuid("Pemilik aktivitas tidak valid"),
    activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
    activity_type: z.enum(ACTIVITY_TYPES),
    description: z.string().trim().min(10, "Deskripsi minimal 10 karakter"),
    quantity: z.coerce.number().positive().optional(),
    client: z.string().trim().optional(),
    result: z.enum(["deal", "no"]).optional(),
    no_reason: z.string().trim().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.activity_type === "oplah" && !v.quantity) ctx.addIssue({ code: "custom", message: "Jumlah oplah wajib diisi" });
    if (v.activity_type === "hasil" && !v.result) ctx.addIssue({ code: "custom", message: "Hasil Deal/NO wajib dipilih" });
    if (v.result === "no" && !v.no_reason) ctx.addIssue({ code: "custom", message: "Hasil NO wajib disertai alasan" });
  });
export type ActivityInput = z.infer<typeof activitySchema>;
