import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cards: defineTable({
    CardId: v.string(),
    patient: v.string(),
    doctor: v.string(),
    lab: v.string(),
    caseId: v.string(),
    doctorMobile: v.string(),
    labMobile: v.string(),
    validFrom: v.string(),
    validTo: v.string(),
  }).index("by_card_id", ["CardId"]),
  
  // Add the bills table
  bills: defineTable({
    cardId: v.string(),
    patientName: v.string(),
    doctorName: v.string(),
    labName: v.string(),
    services: v.array(v.object({
      description: v.string(),
      amount: v.number()
    })),
    totalAmount: v.number(),
    dueDate: v.string(),
    status: v.string(), // pending, paid, overdue, cancelled
    notes: v.optional(v.string()),
    createdAt: v.string()
  }).index("by_card_id", ["cardId"])
    .index("by_status", ["status"]),
});