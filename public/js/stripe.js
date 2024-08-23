import { showAlert } from './alerts.js';

export async function getSession(tourId) {
  let stripe = Stripe(
    'pk_test_51OZVb2SH9AxQg5KeFSwo62oswx4xhSdMZGxHdi0g2Ux1YaJLhwTA7KKmpumtAm4dyPat77z2PssCSCCunwR3K2sH007U5Mj9YK',
  );
  try {
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);

    if (!res.ok) {
      throw new Error('Something wrong!!! please try again');
    }
    const data = await res.json();
    console.log(data);
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (err) {
    showAlert('error', err.message);
  }
}
