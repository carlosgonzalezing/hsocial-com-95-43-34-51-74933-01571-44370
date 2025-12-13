
interface NotificationGroupHeaderProps {
  title: string;
}

export function NotificationGroupHeader({ title }: NotificationGroupHeaderProps) {
  return (
    <div className="p-2 bg-muted/30 text-sm font-medium text-muted-foreground">
      {title}
    </div>
  );
}
