/**
 * @module shared/ui/editor
 * @description Read-only rich text display component
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { cn } from '@/shared/lib/utils';

interface RichTextDisplayProps {
    content: string;
    className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={cn('rich-text-display', className)}>
            <EditorContent editor={editor} />
        </div>
    );
}
