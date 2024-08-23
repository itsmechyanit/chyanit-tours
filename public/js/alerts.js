/* eslint-disable*/
function removeAlert() {
  const alertEl = document.querySelector('.alert');
  if (alertEl) {
    const parentEl = document.querySelector('.alert').parentElement;
    parentEl.removeChild(document.querySelector('.alert'));
  }
}

export function showAlert(type, msg) {
  removeAlert();
  const el = `<div class="alert alert--${type}">${msg}</div>`;
  const body = document.querySelector('body');
  body.insertAdjacentHTML('afterbegin', el);
  window.setTimeout(removeAlert, 3000);
}
