/* eslint-disable*/
// import '@babel/polyfill';
import { login, logout, signup, forgot, reset } from './login.js';
import { displayMap } from './leafLet.js';
import { updateData, updateUserPassword } from './updateSettings.js';
import { getSession } from './stripe.js';
import { showAlert } from './alerts.js';
const form = document.querySelector('.form--login');
const map = document.querySelector('#map');
const logoutBtn = document.querySelector('.nav__el-logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form.form-user-password');
const bookTourBtn = document.getElementById('book-tour');
const signUpForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgotpassword');
const resetPasswordForm = document.querySelector('.form--resetpassword');

if (resetPasswordForm) {
  const token = window.location.pathname.split('/').at(-1);
  const password = document.querySelector('#password');
  const passwordConfirm = document.querySelector('#passwordConfirm');
  resetPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    reset(password.value, passwordConfirm.value, token);
  });
}

if (forgotPasswordForm) {
  const email = document.querySelector('#email');
  forgotPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    forgot(email.value);
  });
}

if (signUpForm) {
  const name = document.querySelector('#name');
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');
  const passwordConfirm = document.querySelector('#passwordConfirm');
  signUpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    signup({
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    });
  });
}

if (userDataForm) {
  const userPhoto = document.querySelector('.form__user-photo');
  const emailEl = document.querySelector('#email');
  const nameEl = document.querySelector('#name');
  const photoEl = document.getElementById('photo');
  const formData = new FormData();

  userDataForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    formData.append('name', nameEl.value);
    formData.append('email', emailEl.value);
    formData.append('photo', photoEl.files[0]);
    const data = await updateData(formData);

    if (!data) return;
    emailEl.value = data.data.user.email;
    nameEl.value = data.data.user.name;
    userPhoto.src = `/img/users/${data.data.user.photo}`;
    window.location.reload();
  });
}

if (userPasswordForm) {
  const passwordCurrent = document.getElementById('password-current');
  const password = document.getElementById('password');
  const passwordConfirm = document.getElementById('password-confirm');
  const updatePassBtn = document.querySelector('.btn-save--password');
  userPasswordForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    updatePassBtn.innerHTML = `UPDATING PASSWORD`;
    await updateUserPassword(
      passwordCurrent.value,
      password.value,
      passwordConfirm.value,
    );
    passwordCurrent.value = '';
    password.value = '';
    passwordConfirm.value = '';
    updatePassBtn.innerHTML = `SAVE PASSWORD`;
  });
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (map) {
  const locations = JSON.parse(
    document.querySelector('#map').dataset.locations,
  );
  displayMap(locations);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', async function (e) {
    e.target.innerHTML = 'processing';
    await getSession(e.target.dataset.tourId);
  });
}

const alert = document.querySelector('body').dataset.alert;

if (alert) {
  showAlert('success', alert, 10);
}
