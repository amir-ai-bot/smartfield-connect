
// Add the following function to supplierService.ts
export const getRatingsByFournisseurId = async (supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    // Map the response to match our Rating type
    const mappedRatings = data.map(rating => ({
      ...rating,
      user: rating.user ? {
        id: rating.user.id,
        name: rating.user.display_name || '',
        avatar: rating.user.avatar
      } : undefined
    }));

    return mappedRatings;
  } catch (error) {
    console.error('Error in getRatingsByFournisseurId:', error);
    return [];
  }
};
