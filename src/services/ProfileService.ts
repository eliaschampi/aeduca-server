import Profile, { IProfile } from "../model/Profile";

export const findById = (dni: string) => {
  return Profile.query().findById(dni);
};

export const getLastTime = (dni: string) => {
  return Profile.query().select("last_logout").findById(dni);
};

export const updateProfile = (dni: string, profile: IProfile) => {
  return Profile.query()
    .findById(dni)
    .patch({
      ...profile
    });
};

export const updateLastLogout = (dni: string) => {
  return updateProfile(dni, { last_logout: new Date() });
};
