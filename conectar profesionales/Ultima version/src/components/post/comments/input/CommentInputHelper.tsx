
interface CommentInputHelperProps {
  children: React.ReactNode;
}

export function CommentInputHelper({ children }: CommentInputHelperProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xs text-muted-foreground">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </div>
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
}
