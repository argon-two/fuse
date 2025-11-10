import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ServerSidebar } from "../components/ServerSidebar";
import { ChannelSidebar } from "../components/ChannelSidebar";
import { MessageList } from "../components/MessageList";
import { MessageComposer } from "../components/MessageComposer";
import { VoiceChannelPanel } from "../components/VoiceChannelPanel";
import { useServers, useServerDetail } from "../hooks/useServers";
import { useChannelMessages } from "../hooks/useMessages";
import { useChatSocket } from "../hooks/useChatSocket";
import { sendMessage } from "../api/messages";
import { connectSocket } from "../lib/socket";

function WorkspacePage() {
  const params = useParams<{ serverSlug?: string; channelId?: string }>();
  const navigate = useNavigate();
  const { data: servers, isLoading: serversLoading } = useServers();
  const { data: serverDetail } = useServerDetail(params.serverSlug);

  useEffect(() => {
    connectSocket();
  }, []);

  useEffect(() => {
    if (!serversLoading && servers && servers.length > 0 && !params.serverSlug) {
      const targetServer = servers[0];
      navigate(`/app/${targetServer.slug}`, { replace: true });
    }
  }, [servers, serversLoading, params.serverSlug, navigate]);

  const channels = serverDetail?.channels ?? [];
  const activeChannel = useMemo(() => {
    if (!channels.length) return undefined;
    if (params.channelId) {
      return channels.find((channel) => channel.id === params.channelId) ?? channels[0];
    }
    return channels[0];
  }, [channels, params.channelId]);

  useEffect(() => {
    if (serverDetail && activeChannel && params.channelId !== activeChannel.id) {
      navigate(`/app/${serverDetail.slug}/${activeChannel.id}`, { replace: true });
    }
  }, [activeChannel, navigate, params.channelId, serverDetail]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, appendMessage } = useChannelMessages(
    activeChannel?.type === "TEXT" ? activeChannel?.id : undefined,
  );

  const messages = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.messages);
  }, [data]);

  useChatSocket({
    channelId: activeChannel?.type === "TEXT" ? activeChannel.id : undefined,
    onMessage: appendMessage,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
  });

  const handleSendMessage = async ({ content, attachments }: { content: string; attachments: any[] }) => {
    if (!activeChannel) return;
    await sendMessageMutation.mutateAsync({
      channelId: activeChannel.id,
      content,
      attachments,
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <ServerSidebar
        servers={servers ?? []}
        activeServerSlug={serverDetail?.slug}
        onSelect={(server) => {
          navigate(`/app/${server.slug}`);
        }}
      />
      <ChannelSidebar
        channels={channels}
        activeChannelId={activeChannel?.id}
        onSelectChannel={(channel) => navigate(`/app/${serverDetail?.slug}/${channel.id}`)}
      />
      <main className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-surface/80 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {activeChannel ? `#${activeChannel.name}` : "Канал не выбран"}
            </h2>
            <p className="text-xs text-muted">
              {serverDetail?.name}
              {activeChannel?.description ? ` • ${activeChannel.description}` : ""}
            </p>
          </div>
        </header>
        {activeChannel?.type === "VOICE" ? (
          <VoiceChannelPanel channelId={activeChannel.id} enabled />
        ) : (
          <>
            <MessageList
              messages={messages}
              onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
            />
            <MessageComposer onSend={handleSendMessage} disabled={sendMessageMutation.isPending} />
          </>
        )}
      </main>
    </div>
  );
}

export default WorkspacePage;
