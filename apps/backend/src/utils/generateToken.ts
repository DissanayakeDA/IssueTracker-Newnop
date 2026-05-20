import jwt, { SignOptions } from "jsonwebtoken";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

const generateToken = (userId: string): string => {
  const options: SignOptions = {};
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (expiresIn) {
    options.expiresIn = expiresIn as unknown as SignOptions["expiresIn"];
  } else {
    options.expiresIn = "7d" as unknown as SignOptions["expiresIn"];
  }
  return jwt.sign({ id: userId }, getJwtSecret(), options);
};

export default generateToken;
