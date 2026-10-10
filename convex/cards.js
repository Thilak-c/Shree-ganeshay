import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCardByCardId = query({
  args: { cardId: v.string() },
  handler: async ({ db }, { cardId }) => {
    return await db
      .query("cards")
      .withIndex("by_card_id", (q) => q.eq("CardId", cardId))
      .first();
  },
});

export const addCard = mutation({
  args: {
    CardId: v.string(),
    patient: v.string(),
    doctor: v.string(),
    lab: v.string(),
    caseId: v.string(),
    doctorMobile: v.string(),
    labMobile: v.string(),
    validFrom: v.string(),
    validTo: v.string(),
  },
  handler: async ({ db }, args) => {
    return await db.insert("cards", args);
  },
});

export const getAllCards = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("cards").order("desc").collect();
  },
});

export const deleteCard = mutation({
  args: { id: v.id("cards") },
  handler: async ({ db }, { id }) => {
    return await db.delete(id);
  },
});