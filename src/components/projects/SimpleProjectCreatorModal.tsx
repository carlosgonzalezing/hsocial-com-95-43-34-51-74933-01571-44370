import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PROJECT_CATEGORIES, type ProjectFormData } from '@/types/project';
import { createProject } from '@/lib/api/projects/create-project';
import { useQueryClient } from '@tanstack/react-query';

interface SimpleProjectCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleProjectCreatorModal({ open, onOpenChange }: SimpleProjectCreatorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setFiles(Array.from(list));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ variant: 'destructive', title: 'Faltan campos', description: 'Título y descripción son requeridos' });
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Partial<ProjectFormData> = {
        title: title.trim(),
        description: description.trim(),
        category: category || 'Otro',
        status: 'planning'
      } as ProjectFormData;

      await createProject(data as ProjectFormData, files.length === 1 ? files[0] : files);

      toast({ title: 'Proyecto publicado', description: 'Tu proyecto se ha publicado correctamente' });
      queryClient.invalidateQueries({ queryKey: ['project-posts'] });
      onOpenChange(false);
      setTitle(''); setDescription(''); setCategory(''); setFiles([]);
    } catch (error) {
      console.error('Error publishing simple project:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo publicar el proyecto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Publicar proyecto (rápido)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Título del proyecto" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Descripción breve" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {PROJECT_CATEGORIES.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileChange} />
            {files.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {files.map(f => (<div key={f.name}>{f.name}</div>))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white">
              {isSubmitting ? 'Publicando...' : 'Publicar proyecto'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
