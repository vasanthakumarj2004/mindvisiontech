export function formatPhone(phone) {
  return phone.replace(/[^\d+]/g, '');
}