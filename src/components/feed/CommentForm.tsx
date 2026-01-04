import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';

interface CommentFormProps {
  postId: string;
  userId: string | undefined;
  onAddComment: (content: string) => Promise<void>;
  className?: string;
}

export function CommentForm({ postId, userId, onAddComment, className = '' }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userId) return;

    try {
      setIsSubmitting(true);
      await onAddComment(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        className="flex-1"
        disabled={isSubmitting || !userId}
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!content.trim() || isSubmitting || !userId}
        className="shrink-0"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Enviar comentario</span>
      </Button>
    </form>
  );
}

export default CommentForm;
