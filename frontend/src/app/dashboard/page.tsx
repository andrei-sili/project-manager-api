import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <h1 className="text-xl font-bold">Bine ai venit în aplicație!</h1>
      <p>Acesta este conținutul principal.</p>
    </ProtectedRoute>
  );
}
