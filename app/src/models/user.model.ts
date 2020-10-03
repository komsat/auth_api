import * as mongoose from 'mongoose';
import User from '../interfaces/user.interface';

const addressSchema = new mongoose.Schema({
  city: String,
  country: String,
  street: String,
});

const sessionSchema = new mongoose.Schema({
  id: String,
  created: String,
  user_agent: String
});

const userSchema = new mongoose.Schema(
  {
    address: addressSchema,
    email: String,
    firstName: String,
    lastName: String,
    password: {
      type: String,
      get: (): undefined => undefined,
    },
    sessionInfo: sessionSchema,
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default userModel;