/* eslint-disable*/

import { showAlert } from './alerts.js';

export async function login(email, password) {
  let data;
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ email, password }),
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }

    showAlert('success', 'Logged in successfully');
    window.location.assign('/');
  } catch (err) {
    showAlert('error', data.message);
  }
}

export async function logout() {
  try {
    const res = await fetch('/api/v1/users/logout');

    showAlert('success', 'logged out successfully');
    window.location.assign('/');
  } catch (err) {
    showAlert('error', 'Please try again later');
  }
}

export async function signup(values) {
  const { name, email, password, passwordConfirm } = values;
  let data;
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }

    showAlert('success', 'Account created successfully');
    window.location.assign('/login');
  } catch (err) {
    showAlert('error', data.message);
  }
}

export async function forgot(email) {
  let data;
  try {
    const res = await fetch('/api/v1/users/forgotPasswordWeb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ email }),
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }

    showAlert(
      'success',
      'Please check your email for password reset token',
    );
  } catch (err) {
    showAlert('error', data.message);
  }
}

export async function reset(password, passwordConfirm, token) {
  let data;
  try {
    const res = await fetch(`/api/v1/users/resetPassword/${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ password, passwordConfirm }),
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }

    showAlert('success', 'password has been changed');
    window.location.assign('/login');
  } catch (err) {
    showAlert('error', data.message);
  }
}
