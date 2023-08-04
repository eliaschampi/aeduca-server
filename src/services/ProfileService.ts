import Profile, { IProfile } from "../model/Profile";

export const findById = async (dni: string): Promise<Profile | undefined> => {
  return await Profile.query().findById(dni);
};

export const getLastTime = async (dni: string): Promise<Profile | undefined> => {
  return await Profile.query().select("last_logout").findById(dni);
};

export const updateProfile = async (dni: string, p: IProfile): Promise<number> => {
  return await Profile.query()
    .findById(dni)
    .patch({
      ...p
    });
};

export const updateLastLogout = async (dni: string): Promise<number> => {
  return await updateProfile(dni, { last_logout: new Date() });
};
