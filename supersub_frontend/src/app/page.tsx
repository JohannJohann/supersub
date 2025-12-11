import { redirect } from 'next/navigation';

export default function Home() {
  // Middleware will handle authentication and redirect appropriately
  // This will redirect to /dashboard for authenticated users
  redirect('/dashboard');
}
