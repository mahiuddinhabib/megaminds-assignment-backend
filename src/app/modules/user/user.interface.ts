import { Model } from 'mongoose';

export type IUser = {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  address?: string;
};

export type UserModel = Model<IUser, Record<string, unknown>>;