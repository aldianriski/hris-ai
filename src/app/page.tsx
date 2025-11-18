import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to employer dashboard by default
  // In production, this should check auth and redirect accordingly
  redirect('/hr/employees');
}
