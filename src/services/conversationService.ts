
export { getUserConversations, getConversation, getConversationMessages, sendMessage, sendMessageWithFiles, sendVoiceMessage, markMessagesAsRead, getUnreadMessageCount, createConversation, rateFournisseur, getFournisseurRatings, getFournisseurAverageRating, toggleFavoriteFournisseur, isFournisseurFavorite, getFavoriteFournisseurs };

// Add an alias for getConversationMessages to maintain backward compatibility
export const getMessages = getConversationMessages;
