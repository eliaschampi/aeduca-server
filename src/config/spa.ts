import express from "express";

export default function (app: express.Express): void {
  if (process.env.NODE_ENV === "production") {
    app.get("/*", function (req, res) {
      res.sendFile(<string>process.env.SPA_INDEX);
    });
    app.use(express.static(<string>process.env.SPA_STATIC));
  }
}
