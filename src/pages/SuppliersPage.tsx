
// Update the suppliers state handling to fix the type issues
// Find the relevant code that sets suppliers state and update it:

// Instead of:
// setSuppliers(data);

// Use:
const mappedSuppliers = data.map(supplier => ({
  ...supplier,
  products: supplier.products || [] // Ensure products is always an array
}));
setSuppliers(mappedSuppliers);
