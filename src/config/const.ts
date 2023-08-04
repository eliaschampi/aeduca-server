export const notInTrash = " COALESCE(parent_path, '') not like '/trash/%' ";

export const fileVal =
  /([a-zA-ZÀ-ú0-9-_¿? ])+\.(mp4|avi|txt|xlsx|xls|ppt|pptx|doc|docx|pdf|png|jpg|jpeg|svg|zip|rar|mp3|wav|wma)$/;

export const mimes = {
  pdf: "application/pdf",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  zip: "application/zip"
};

export const MESSAGE_RESPONSE = "ok";

export const ROOM_ADD_PERSON = "add";

export const BAD_REQUEST = 500;

export type Callbk = () => void;

export type Callvar = (...args: any[]) => any;
