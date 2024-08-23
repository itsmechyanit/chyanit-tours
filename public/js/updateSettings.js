import { showAlert } from './alerts.js';

// export async function updateData(name, email) {
//   let data;
//   try {
//     const settings = { name, email };
//     const res = await fetch('/api/v1/users/updateMe', {
//       method: 'PATCH',
//       headers: {
//         'Content-type': 'application/json',
//       },
//       body: JSON.stringify(settings),
//     });

//     data = await res.json();

//     if (!res.ok) {
//       throw new Error();
//     }
//     await showAlert('success', 'Data Updated Successfully');
//     return data;
//   } catch (err) {
//     await showAlert('error', data.message);
//   }
// }

export async function updateData(formData) {
  let data;
  try {
    const res = await fetch('/api/v1/users/updateMe', {
      method: 'PATCH',

      body: formData,
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }
    showAlert('success', 'Data Updated Successfully');
    return data;
  } catch (err) {
    showAlert('error', data.message);
  }
}

export async function updateUserPassword(
  passwordCurrent,
  password,
  passwordConfirm,
) {
  let data;
  try {
    const settings = { passwordCurrent, password, passwordConfirm };
    const res = await fetch('/api/v1/users/changeMyPassword', {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    data = await res.json();

    if (!res.ok) {
      throw new Error();
    }
    showAlert('success', 'PASSWORD Updated Successfully');
  } catch (err) {
    showAlert('error', data.message);
  }
}
