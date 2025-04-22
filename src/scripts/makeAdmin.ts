import { setUserAsAdmin } from '@/services/adminService';

async function makeAdmin() {
  try {
    const success = await setUserAsAdmin('yassindhibi100@gmail.com');
    if (success) {
      console.log('Successfully made user admin');
    } else {
      console.error('Failed to make user admin');
    }
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

makeAdmin(); 