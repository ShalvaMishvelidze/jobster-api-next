import validator from "validator";

export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const isValidPassword = (password: string): boolean => {
  return (
    validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }) &&
    password.includes(" ") &&
    password.length <= 20
  );
};

export const areValidUserFields = (
  name: string,
  lastName: string,
  location: string
): boolean => {
  return location.length <= 255 && name.length <= 50 && lastName.length <= 50;
};
