// import { Response } from "express";

const setHeaders = (res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
    // 'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,X-AUTH-TOKEN,X-Auth-Token,x-auth-token',
    "Strict-Transport-Security": "max-age=63072000",
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "strict-origin",
    "Expect-CT": "max-age=86400, enforce",
  });
};

const success = (res, message, data) => {
  setHeaders(res);
  res.status(200).json({ error: false, message, data });
};

const badRequest = (res, message, data) => {
  setHeaders(res);
  res.status(400).json({ error: true, message, data });
};

const notFound = (res, message, data) => {
  setHeaders(res);
  res.status(404).json({ error: true, message, data });
};

const internalServerError = (res, message, data) => {
  setHeaders(res);
  res.status(500).json({ error: true, message, data });
};

const unAuthorized = (res, message) => {
  setHeaders(res);
  res.status(401).json({ error: true, message });
};

const forbidden = (res, message) => {
  setHeaders(res);
  res.status(403).json({ error: true, message });
};

module.exports = {
  success,
  badRequest,
  internalServerError,
  forbidden,
  notFound,
  unAuthorized,
};
