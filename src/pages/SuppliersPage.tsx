
// Update the specific code mentioned in the error
// This replaces lines 9-13 in the file

// Instead of:
// const mappedSuppliers = data.map(supplier => ({
//   ...supplier,
//   products: supplier.products || [] // Ensure products is always an array
// }));
// setSuppliers(mappedSuppliers);

// Use this:
const mappedSuppliers = data.map(supplier => ({
  ...supplier,
  products: supplier.products || [] // Ensure products is always an array
}));
setSuppliers(mappedSuppliers);
