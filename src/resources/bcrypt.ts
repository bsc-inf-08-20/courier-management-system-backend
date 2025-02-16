import * as brcrpt from 'bcrypt';

export function encodePassword(rawPassword: string) {
  const SALT = brcrpt.genSaltSync();
  return brcrpt.hashSync(rawPassword, SALT);
}

export function comparePasswords(rawPassword: string, hash: string) {
  return brcrpt.compareSync(rawPassword, hash);
}
