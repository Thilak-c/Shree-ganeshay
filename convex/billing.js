import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllBills = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("bills").order("desc").collect();
  },
});

export const getBillsByCard = query({
  args: { cardId: v.string() },
  handler: async ({ db }, { cardId }) => {
    return await db
      .query("bills")
      .withIndex("by_card_id", (q) => q.eq("cardId", cardId))
      .collect();
  },
});

export const createBill = mutation({
  args: {
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
    notes: v.optional(v.string()),
    status: v.string(),
    createdAt: v.string()
  },
  handler: async ({ db }, args) => {
    return await db.insert("bills", args);
  },
});

export const updateBillStatus = mutation({
  args: { id: v.id("bills"), status: v.string() },
  handler: async ({ db }, { id, status }) => {
    return await db.patch(id, { status });
  },
});