import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Paperclip, SendHorizonal, X } from "lucide-react";
import type { Attachment } from "../types/api";
import { uploadFiles } from "../api/uploads";

interface MessageComposerProps {
  onSend: (payload: { content: string; attachments: Attachment[] }) => Promise<void>;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (files) => {
      setAttachments((prev) => [...prev, ...files]);
    },
  });

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim() && attachments.length === 0) {
      return;
    }
    await onSend({ content: content.trim(), attachments });
    setContent("");
    setAttachments([]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <form onSubmit={handleSend} className="border-t border-white/5 bg-surface/70 px-6 py-4 backdrop-blur">
      <div className="space-y-3">
        {attachments.length ? (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accentSoft"
              >
                <Paperclip className="h-4 w-4" />
                <span className="max-w-[200px] truncate">{file.fileName}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="text-accent hover:text-accentMuted"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="accent-ring flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surfaceElevated text-muted transition hover:border-accent/40 hover:text-accent"
            disabled={uploadMutation.isPending || disabled}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={1}
            placeholder="Напишите сообщение..."
            className="min-h-[48px] flex-1 resize-none rounded-xl border border-white/10 bg-surfaceElevated px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            disabled={disabled}
          />
          <button
            type="submit"
            className="accent-ring flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-background transition hover:bg-accentMuted disabled:opacity-60"
            disabled={disabled || uploadMutation.isPending}
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
        {uploadMutation.isPending ? (
          <div className="text-xs text-muted">Загружаем файлы...</div>
        ) : null}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = event.target.files;
          if (!files || !files.length) return;
          uploadMutation.mutate(Array.from(files));
          event.target.value = "";
        }}
      />
    </form>
  );
}
