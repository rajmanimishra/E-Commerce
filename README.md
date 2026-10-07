# Grocify

Grocify is a React storefront backed by an Express API and MongoDB. Customers can browse products, place orders, and manage their accounts. Store staff use the admin area to manage the catalog, orders, and customer access.

## Set up an admin account

Configure `MONGO_URI`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`. Use a unique JWT secret and an admin password with at least 12 characters. Keep this file out of source control. The backend uses the operating system's DNS settings by default for MongoDB SRV lookups. If your network requires specific resolvers, optionally set `MONGODB_DNS_SERVERS` to a comma-separated list of DNS server IPs.

From the `backend` directory, run:

```sh
npm run create-admin
```

This creates or updates the admin account in MongoDB; there is no public admin registration route. To sign in locally, start the backend from `backend` with `npm run dev`, start the frontend from the project root with `npm run dev`, then open `/admin/login`. In development, the admin pages use `http://localhost:3000` unless `VITE_API_URL` is set. Make sure `MONGO_URI` points to the same database used by the backend.

For a deployed admin account, set the admin values on the backend host and run the setup command against that host's MongoDB. A locally-created account does not automatically exist in the production database.

Admin sessions expire after one day. Product changes, order management, and customer account updates are checked by the API as well as the admin page.

If your API runs at a different address, set `VITE_API_URL` for the frontend build to that API's base URL.

## Upload product images

In the admin dashboard, choose **Products → Add product**, select a JPG, PNG, or WebP image (up to 5 MB), and save the product. The image is stored in MongoDB GridFS and shown in the storefront, cart, wishlist, and order views. Existing image URLs and bundled filenames can still be used.

## Customer password reset

Forgot-password emails use SMTP. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, and `FRONTEND_URL` in the backend environment. Use an app password or SMTP credential from your email provider; don't commit these values. `FRONTEND_URL` should be the deployed storefront origin. Reset links expire after 15 minutes and can only be used once. Requests are limited to one email per account each minute, and the response doesn't reveal whether an account exists.

Customers can generate ten one-time password recovery codes from **Profile → Password recovery codes** without configuring an email service. Save these codes securely; they are displayed only once, stored as hashes, and each code is consumed after use. Generating a new set invalidates all remaining codes from the previous set. On the forgot-password page, choose **Recovery code**, enter the account email and one saved code, then choose a new password within 15 minutes. A recovery code must be generated in advance while signed in.
