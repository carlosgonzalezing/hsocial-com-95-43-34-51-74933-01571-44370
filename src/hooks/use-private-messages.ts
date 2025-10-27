
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Friend } from './use-friends';
import { handleMessageMentions } from "@/lib/notifications/mention-notifications";
import { processImageForUpload } from "@/lib/image-compression";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read_at: string | null;
  is_deleted?: boolean;
}

export function usePrivateMessages(currentUserId?: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const loadMessages = async (currentUserId: string, selectedFriend: Friend) => {
    if (!selectedFriend || !currentUserId) return;

    try {
      console.log("Loading messages between", currentUserId, "and", selectedFriend.friend_id);
      
      // Improved query to correctly filter conversations between the two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedFriend.friend_id}),and(sender_id.eq.${selectedFriend.friend_id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log("Messages loaded:", data ? data.length : 0);
      
      // Verificar y marcar mensajes antiguos como eliminados
      const processedMessages = (data || []).map((msg: Message) => {
        const messageDate = new Date(msg.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
        
        // Si el mensaje tiene más de 24 horas y no está marcado como eliminado
        if (hoursSinceCreation > 24 && !msg.is_deleted) {
          // Actualizar en la base de datos silenciosamente
          supabase
            .from('messages')
            .update({ 
              is_deleted: true,
              content: "Este mensaje ha sido eliminado automáticamente" 
            })
            .eq('id', msg.id);
          
          // Devolver el mensaje actualizado para la UI
          return {
            ...msg,
            is_deleted: true,
            content: "Este mensaje ha sido eliminado automáticamente"
          };
        }
        
        return msg;
      });
      
      setMessages(processedMessages);
      
      // Mark messages as read
      const unreadMessages = data?.filter(msg => 
        msg.receiver_id === currentUserId && 
        msg.sender_id === selectedFriend.friend_id && 
        !msg.read_at
      );
      
      if (unreadMessages && unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los mensajes",
      });
    }
  };

  const sendMessage = async (content: string, currentUserId: string, selectedFriend: Friend) => {
    if (!content.trim() || !selectedFriend || !currentUserId) return false;

    try {
      console.log("Sending message to", selectedFriend.friend_username);
      console.log("Sender ID:", currentUserId);
      console.log("Receiver ID:", selectedFriend.friend_id);
      console.log("Message content:", content);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: selectedFriend.friend_id,
          is_deleted: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }
      
      console.log("Message sent successfully");
      setMessages(prev => [...prev, data as Message]);

      // Handle mention notifications
      await handleMessageMentions(content, currentUserId, selectedFriend.friend_id);

      // After sending a message, make sure to create a friendship entry if it doesn't exist
      await ensureFriendshipExists(currentUserId, selectedFriend);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el mensaje",
      });
      return false;
    }
  };
  
  const ensureFriendshipExists = async (currentUserId: string, targetUser: Friend) => {
    try {
      // Check if there's already a follower relationship
      const { data: existingFollow, error: checkError } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUser.friend_id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking friendship:", checkError);
        return;
      }
      
      // If no friendship exists, create one
      if (!existingFollow) {
        console.log("Creating friendship entry for current user");
        const { error: insertError } = await supabase
          .from('followers')
          .insert({
            follower_id: currentUserId,
            following_id: targetUser.friend_id
          });
        
        if (insertError) {
          console.error("Error creating friendship entry:", insertError);
          return;
        }

        // Also create the reverse entry for the other user
        // Get current user's profile info
        const { data: currentUserProfile, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUserId)
          .single();
        
        if (profileError) {
          console.error("Error fetching current user profile:", profileError);
          return;
        }
        
        // Create the reverse friendship entry
        if (currentUserProfile) {
          console.log("Creating reverse friendship entry for the other user");
          await supabase
            .from('followers')
            .insert({
              follower_id: targetUser.friend_id,
              following_id: currentUserId
            });
        }

        console.log("Friendship entries created successfully");
      }
    } catch (error) {
      console.error("Error managing friendship entries:", error);
    }
  };
  
  const deleteMessage = async (messageId: string, currentUserId: string) => {
    try {
      // Verify the message belongs to the current user
      const messageToDelete = messages.find(msg => msg.id === messageId);
      
      if (!messageToDelete) {
        throw new Error("Mensaje no encontrado");
      }
      
      if (messageToDelete.sender_id !== currentUserId) {
        throw new Error("No tienes permiso para eliminar este mensaje");
      }
      
      // Update message content and mark as deleted
      const { error } = await supabase
        .from('messages')
        .update({
          content: "Este mensaje ha sido eliminado",
          is_deleted: true
        })
        .eq('id', messageId);
        
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: "Este mensaje ha sido eliminado", is_deleted: true } 
          : msg
      ));
      
      toast({
        title: "Mensaje eliminado",
        description: "El mensaje ha sido eliminado",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el mensaje",
      });
      return false;
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`private-messages-${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId}`
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId}`
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .subscribe((status) => {
        console.log('Private messages realtime status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return { messages, loadMessages, sendMessage, deleteMessage };
}
