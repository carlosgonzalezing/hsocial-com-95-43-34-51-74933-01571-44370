import { Link } from "react-router-dom";
import { UserPlus, LogIn } from "lucide-react";

export function PublicFeedWall() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <UserPlus className="w-12 h-12 text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Únete a HSocial
      </h2>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        Regístrate para ver más contenido, interactuar con posts y conectar con otros ingenieros.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/auth"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Iniciar sesión
        </Link>
        <Link
          to="/auth"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Registrarse
        </Link>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
        ¿Tienes un código de invitación? Úsalo al registrarte.
      </p>
    </div>
  );
}
