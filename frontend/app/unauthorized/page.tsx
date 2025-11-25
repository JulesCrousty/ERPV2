export default function UnauthorizedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-red-600">Access denied</h1>
      <p className="text-slate-600">You do not have the required role to view this area.</p>
    </div>
  );
}
