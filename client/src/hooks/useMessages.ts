import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { Message } from "../types/api";
import { listMessages } from "../api/messages";

const PAGE_SIZE = 50;

export function useChannelMessages(channelId?: string) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["messages", channelId],
    queryFn: ({ pageParam }) => {
      if (!channelId) {
        return Promise.reject(new Error("no-channel"));
      }
      return listMessages(channelId, {
        limit: PAGE_SIZE,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(channelId),
    refetchOnMount: false,
  });

  const appendMessage = (message: Message) => {
    queryClient.setQueryData(["messages", channelId], (oldData: any) => {
      if (!oldData) {
        return {
          pageParams: [undefined],
          pages: [
            {
              messages: [message],
              nextCursor: undefined,
            },
          ],
        };
      }

      const cloned = structuredClone(oldData) as {
        pageParams: unknown[];
        pages: Array<{ messages: Message[]; nextCursor?: string }>;
      };

      const lastPage = cloned.pages[cloned.pages.length - 1];
      if (!lastPage) {
        cloned.pages = [{ messages: [message], nextCursor: undefined }];
      } else {
        lastPage.messages.push(message);
      }

      return cloned;
    });
  };

  return {
    ...query,
    appendMessage,
  };
}
