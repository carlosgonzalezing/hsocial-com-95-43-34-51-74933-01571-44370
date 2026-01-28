export type SplitConversationsResult<T> = {
  conversacionesPrincipales: T[];
  solicitudesDeMensajes: T[];
};

type SplitConversationsOptions<T> = {
  isMutualFollow: (conversation: T) => boolean;
  isGlobal?: (conversation: T) => boolean;
};

export function splitConversationsByMutualFollow<T>(
  conversations: T[],
  options: SplitConversationsOptions<T>
): SplitConversationsResult<T> {
  const conversacionesPrincipales: T[] = [];
  const solicitudesDeMensajes: T[] = [];

  for (const conversation of conversations) {
    if (options.isGlobal?.(conversation)) {
      conversacionesPrincipales.push(conversation);
      continue;
    }

    if (options.isMutualFollow(conversation)) {
      conversacionesPrincipales.push(conversation);
    } else {
      solicitudesDeMensajes.push(conversation);
    }
  }

  return { conversacionesPrincipales, solicitudesDeMensajes };
}
