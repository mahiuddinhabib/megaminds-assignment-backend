import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';

export const UserSchema = new Schema<IUser, UserModel>(
  {
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser, UserModel>('User', UserSchema);
