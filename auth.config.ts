import type { NextAuthConfig } from 'next-auth';
export const authConfig = {
  pages: {
    signIn: '/login',
  },
   callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} as NextAuthConfig;

/// authorized callback được dùng để verify yêu cầu được ủy quyền truy cập đến 1 trang với Next.js Middleware. được gọi trước 1 request được hoàn thành, và nó nhận 1 object với thuộc tính auth và request . thuộc tính auth chứa session của user, request chứa thông tin về request hiện tại.

// providers là mảng để list ra các option login khác nhau 