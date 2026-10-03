# Grocify

Grocify is a React storefront backed by an Express API and MongoDB. Customers can browse products, place orders, and manage their accounts. Store staff use the admin area to manage the catalog, orders, and customer access.

## Set up an admin account

Configure `MONGO_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`. Use a unique JWT secret and an admin password with at least 12 characters. Keep this file out of source control.

From the `backend` directory, run:

```sh
npm run create-admin
```

This creates or updates the admin account in MongoDB; there is no public admin registration route. Start the backend and frontend as usual, then open `/admin/login`. Add the same admin settings to your backend host's environment before running the setup command there.

Admin sessions expire after one day. Product changes, order management, and customer account updates are checked by the API as well as the admin page.

If your API runs at a different address, set `VITE_API_URL` for the frontend build to that API's base URL.

## Customer password reset

Forgot-password emails use SMTP. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `FRONTEND_URL` in the backend environment. Use an app password or SMTP credential from your email provider; don't commit these values. `FRONTEND_URL` should be the deployed storefront origin. Reset links expire after 15 minutes and can only be used once. Requests are limited to one email per account each minute, and the response doesn't reveal whether an account exists.
