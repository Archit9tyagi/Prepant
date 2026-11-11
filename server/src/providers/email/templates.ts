const layout = (title: string, body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1 style="color:#4f46e5">Prepant</h1><h2>${title}</h2><p>${body}</p></div>`;

export const emailTemplates = {
  verify: (name: string, url: string) => ({
    subject: 'Verify your Prepant email',
    html: layout(
      'Verify your email',
      `Hi ${name}, <a href="${url}">verify your email address</a> to activate your account.`,
    ),
  }),
  welcome: (name: string) => ({
    subject: 'Welcome to Prepant',
    html: layout(
      'Welcome to Prepant',
      `Hi ${name}, your account is ready. We are glad you are here.`,
    ),
  }),
  reset: (url: string) => ({
    subject: 'Reset your Prepant password',
    html: layout(
      'Reset your password',
      `<a href="${url}">Choose a new password</a>. This link expires in one hour.`,
    ),
  }),
  mentorApproved: (name: string) => ({
    subject: 'Your Prepant mentor profile is approved',
    html: layout(
      'You are approved',
      `Hi ${name}, your mentor profile is now approved and can be published on Prepant.`,
    ),
  }),
  mentorRejected: (name: string, reason: string) => ({
    subject: 'Update needed for your Prepant mentor profile',
    html: layout(
      'A little more information is needed',
      `Hi ${name}, please update your mentor profile: ${reason}`,
    ),
  }),
};
