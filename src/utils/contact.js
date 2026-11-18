export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = { name: 100, email: 254, message: 3000 };

/** Validate the contact form. Returns an object of field -> error message (empty when valid). */
export function validateContact({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Please enter your name.';
  else if (name.trim().length > LIMITS.name) errors.name = `Name must be under ${LIMITS.name} characters.`;
  if (!email.trim()) errors.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.';
  if (!message.trim()) errors.message = 'Please write a short message.';
  else if (message.trim().length < 10) errors.message = 'Your message is a little short — please add some detail.';
  else if (message.trim().length > LIMITS.message) errors.message = `Message must be under ${LIMITS.message} characters.`;
  return errors;
}

/** Build the prefilled WhatsApp message text. */
export function buildWhatsAppMessage({ name, email, message }) {
  return [
    'Hello EL NORAN Team,',
    '',
    `My name is ${name.trim()}.`,
    `My email is ${email.trim()}.`,
    '',
    'My inquiry:',
    message.trim(),
    '',
    'I am interested in learning more about your products and export services.',
    '',
    'Best regards.',
  ].join('\n');
}

/** wa.me deep link — opens a chat with ONE recipient, prefilled. */
export const whatsappLink = (number, text) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
