/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const isUserExist = async function (phoneNumber: string, UserDb: any) {
  return await UserDb.findOne(
    { phoneNumber },
    { _id: 1, phoneNumber: 1}
  ).lean();
};
