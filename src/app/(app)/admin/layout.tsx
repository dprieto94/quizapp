import { AdminTab } from "@/components/admin/AdminTab";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Administración</h1>
        <p className="text-muted text-sm mt-1">
          Gestión de contenido del banco de preguntas
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        <AdminTab href="/admin/asignaturas">Asignaturas</AdminTab>
        <AdminTab href="/admin/temas">Temas</AdminTab>
        <AdminTab href="/admin/preguntas">Preguntas</AdminTab>
      </nav>
      {children}
    </div>
  );
}
