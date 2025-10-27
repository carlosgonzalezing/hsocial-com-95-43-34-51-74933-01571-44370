import { Star, MessageCircle, Menu, TrendingUp, Bookmark, Settings, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: TrendingUp, label: "Tabla de Popularidad", path: "/popularidad" },
    { icon: Bookmark, label: "Guardados", path: "/guardados" },
    { icon: Settings, label: "Configuración y privacidad", path: "/configuracion" },
    { icon: Monitor, label: "Pantalla y accesibilidad", path: "/pantalla" },
  ];

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
           {" "}
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
               {" "}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
                   {" "}
          <div className="relative">
                        {/* ÍCONO H: Degradado de Azul (#4F46E5) a Púrpura (#8B5CF6) */}           {" "}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#8B5CF6] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                            <span className="text-white font-bold text-xl">H</span>           {" "}
            </div>
                        {/* PUNTO INFERIOR: Púrpura sólido (#8B5CF6) */}           {" "}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#8B5CF6] rounded-full border-2 border-background"></div>
                     {" "}
          </div>
                    {/* TEXTO "Social": Degradado de Azul (#4F46E5) a Púrpura (#8B5CF6) */}         {" "}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] bg-clip-text text-transparent">
                        Social          {" "}
          </h1>
                 {" "}
        </button>
               {" "}
        <div className="flex items-center gap-5">
                   {" "}
          <button onClick={() => navigate("/notificaciones")}>
                        <Star className="w-6 h-6 cursor-pointer hover:text-accent transition-colors" />         {" "}
          </button>
                   {" "}
          <button onClick={() => navigate("/mensajes")}>
                        <MessageCircle className="w-6 h-6 cursor-pointer hover:text-accent transition-colors" />       
             {" "}
          </button>
                              {" "}
          <Sheet open={open} onOpenChange={setOpen}>
                       {" "}
            <SheetTrigger asChild>
                           {" "}
              <button>
                                <Menu className="w-6 h-6 cursor-pointer hover:text-accent transition-colors" />         
                   {" "}
              </button>
                         {" "}
            </SheetTrigger>
                       {" "}
            <SheetContent side="right" className="w-72 bg-background border-l border-border">
                           {" "}
              <div className="flex flex-col h-full py-6">
                               {" "}
                <div className="flex-1 space-y-1">
                                   {" "}
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                                            <item.icon className="w-5 h-5" />                     {" "}
                      <span className="text-sm">{item.label}</span>                   {" "}
                    </button>
                  ))}
                                 {" "}
                </div>
                                                {" "}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors mt-4 border-t border-border pt-4"
                >
                                   {" "}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                                     {" "}
                  </svg>
                                    <span className="text-sm font-medium">Cerrar Sesión</span>               {" "}
                </button>
                             {" "}
              </div>
                         {" "}
            </SheetContent>
                     {" "}
          </Sheet>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </header>
  );
};

export default Header;
