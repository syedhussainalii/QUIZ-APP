This is a Next.js university quiz platform using Supabase PostgreSQL and NextAuth credentials sessions.

## Authentication

Google OAuth has been removed. The app now uses separate Student and Teacher login portals backed by `CredentialsProvider`.

- Student login: `/login/student`
- Teacher login: `/login/teacher`
- Student dashboard: `/student/dashboard`
- Teacher dashboard: `/teacher/dashboard`

The selected portal only chooses the login form. The authenticated role is always read from `users.role` after bcrypt password verification against `users.password_hash`.

Development accounts seeded by `scripts/schema.sql`:

- Student: `student@gmail.com` / `123456`
- Teacher: `teacher@kiet.edu.pk` / `123456`

The password is stored only as a bcrypt hash in Supabase. To change a demo password, run:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('new-password', 12).then(console.log)"
```

Then update `users.password_hash` for the desired demo user.

No longer needed in `.env.local`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
