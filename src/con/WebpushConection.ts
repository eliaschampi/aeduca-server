import webpush from "web-push";

export default (): void => {
  const VAPID_PUBLIC_KEY = <string>process.env.PUSH_VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = <string>process.env.PUSH_VAPID_PRIVATE_KEY;
  const EMAIL = <string>process.env.PUSH_EMAIL;

  if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY || !EMAIL) {
    throw new Error("Se requiere Claves webpush");
  }

  webpush.setVapidDetails(`mailto:${EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
};
