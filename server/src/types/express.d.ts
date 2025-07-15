import { UserInterface } from "./Users/User";

declare global {
  namespace Express {
    export interface Request {
      user?: UserInterface;
    }
  }
}

export {}