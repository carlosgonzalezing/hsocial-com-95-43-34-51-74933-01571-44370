
interface HiddenPostsToggleProps {
  hiddenPostsCount: number;
  showHidden: boolean;
  onToggleHidden: () => void;
}

export function HiddenPostsToggle({ 
  hiddenPostsCount, 
  showHidden, 
  onToggleHidden 
}: HiddenPostsToggleProps) {
  if (hiddenPostsCount === 0) return null;
  
  return (
    <div className="flex justify-center mb-2">
      <button 
        onClick={onToggleHidden}
        className="text-sm text-primary hover:underline px-3 py-1.5 rounded-full bg-primary/5"
      >
        {showHidden 
          ? "Ocultar filtradas" 
          : `Mostrar ${hiddenPostsCount} ${hiddenPostsCount === 1 ? 'publicación oculta' : 'publicaciones ocultas'}`}
      </button>
    </div>
  );
}
