/**
 * @module shared/ui/editor
 * @description Rich text editor component using Tiptap
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Link2,
    Heading2,
    Code,
    Quote,
    CheckSquare,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start typing...',
    className,
    editable = true,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [2, 3],
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-800 underline',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    return (
        <div className={cn('border rounded-md', className)}>
            {editable && (
                <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('bold') && 'bg-muted'
                        )}
                        title="Bold (Cmd+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('italic') && 'bg-muted'
                        )}
                        title="Italic (Cmd+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('strike') && 'bg-muted'
                        )}
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-8 bg-border mx-1" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('heading', { level: 2 }) && 'bg-muted'
                        )}
                        title="Heading"
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('bulletList') && 'bg-muted'
                        )}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('orderedList') && 'bg-muted'
                        )}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('taskList') && 'bg-muted'
                        )}
                        title="Task List"
                    >
                        <CheckSquare className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-8 bg-border mx-1" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleLink}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('link') && 'bg-muted'
                        )}
                        title="Add Link"
                    >
                        <Link2 className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('codeBlock') && 'bg-muted'
                        )}
                        title="Code Block"
                    >
                        <Code className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={cn(
                            'h-8 w-8 p-0',
                            editor.isActive('blockquote') && 'bg-muted'
                        )}
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
