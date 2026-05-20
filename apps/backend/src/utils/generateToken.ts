import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (userId: string): string => {
  const options: SignOptions = {};
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (expiresIn) {
    options.expiresIn = expiresIn as unknown as SignOptions["expiresIn"];
  } else {
    options.expiresIn = "7d" as unknown as SignOptions["expiresIn"];
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, options);
};

export default generateToken;
