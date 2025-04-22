import { deleteDefaultSuppliers } from '../services/supplierService';

async function main() {
  try {
    const success = await deleteDefaultSuppliers();
    if (success) {
      console.log('Successfully deleted default suppliers');
    } else {
      console.error('Failed to delete default suppliers');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 