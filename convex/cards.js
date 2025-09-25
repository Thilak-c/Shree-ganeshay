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
// Add this to convex/cards.js
// Add this to your existing convex/cards.js file
export const getAllCards = query({
  args: {},
  handler: async ({ db }) => {
    return await db.query("cards").collect();
  },
});