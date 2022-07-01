const composePhoneNumber = (phone_line_number) => {
  const patt = new RegExp(
    /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/g
  );
  let dial_code = '+1';
  const isValid = patt.test(phone_line_number);
  if (isValid) {
    phone_line_number = phone_line_number.replace(/[-()\s]/g, '');
    const matchResult = phone_line_number.match(/^\+?(\d+)(\d{10,})/);
    if (matchResult && matchResult[1]) {
      dial_code = `+${matchResult[1]}`;
      phone_line_number = matchResult[2];
    }
    return `${dial_code}${phone_line_number.replace(/[-()]/g, '')}`;
  }
  return '';
};

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

module.exports = {
  composePhoneNumber,
  capitalize,
};