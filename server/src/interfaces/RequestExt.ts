import { UserInterface } from "./Users/User";

declare namespace Express {
  export interface Request {
    locals: {
      user: UserInterface;
    };
  }
}
