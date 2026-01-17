import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { useEffect, useState } from 'react';
import './ResumeEditor.css';

const ResumeEditor = ({ content, onChange, readOnly = false }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your resume here...',
      }),
    ],
    content: content || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (onChange && !readOnly) {
        onChange(editor.getHTML());
      }
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="resume-editor-container">
      {!readOnly && (
        <div className="editor-toolbar">
          {/* Text Formatting */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active' : ''}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={editor.isActive('subscript') ? 'is-active' : ''}
              title="Subscript"
            >
              X<sub>2</sub>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={editor.isActive('superscript') ? 'is-active' : ''}
              title="Superscript"
            >
              X<sup>2</sup>
            </button>
          </div>

          {/* Colors & Highlight */}
          <div className="toolbar-group">
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
                style={{ position: 'relative' }}
              >
                🎨 Color
              </button>
              {showColorPicker && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  {['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#273E47', '#BD632F', '#D8973C'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: color,
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title={color}
                    />
                  ))}
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setShowColorPicker(false);
                    }}
                    style={{
                      gridColumn: 'span 3',
                      fontSize: '11px',
                      padding: '4px'
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                title="Highlight"
                className={editor.isActive('highlight') ? 'is-active' : ''}
              >
                🖍️ Highlight
              </button>
              {showHighlightPicker && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  {['#ffd98f', '#8fefff', '#ff8f8f', '#8fff8f', '#ff8fff'].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        background: color,
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title={color}
                    />
                  ))}
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPicker(false);
                    }}
                    style={{
                      gridColumn: 'span 2',
                      fontSize: '11px',
                      padding: '4px'
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Font Size & Family */}
          <div className="toolbar-group">
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFontSize(!showFontSize)}
                title="Font Size"
              >
                📏 Size
              </button>
              {showFontSize && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  minWidth: '80px'
                }}>
                  {['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt'].map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
                        setShowFontSize(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: size,
                        textAlign: 'left',
                        border: 'none',
                        background: 'white',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFontFamily(!showFontFamily)}
                title="Font Family"
              >
                🔤 Font
              </button>
              {showFontFamily && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  minWidth: '150px'
                }}>
                  {[
                    { name: 'Arial', value: 'Arial, sans-serif' },
                    { name: 'Times New Roman', value: 'Times New Roman, serif' },
                    { name: 'Georgia', value: 'Georgia, serif' },
                    { name: 'Courier New', value: 'Courier New, monospace' },
                    { name: 'Verdana', value: 'Verdana, sans-serif' },
                    { name: 'Calibri', value: 'Calibri, sans-serif' }
                  ].map(font => (
                    <button
                      key={font.value}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(font.value).run();
                        setShowFontFamily(false);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontFamily: font.value,
                        textAlign: 'left',
                        border: 'none',
                        background: 'white',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Headings */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              title="Heading 3"
            >
              H3
            </button>
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={editor.isActive('paragraph') ? 'is-active' : ''}
              title="Normal text"
            >
              P
            </button>
          </div>

          {/* Lists */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              title="Bullet List"
            >
              • List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
              title="Numbered List"
            >
              1. List
            </button>
          </div>

          {/* Alignment */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
              title="Align Left"
            >
              ⬅
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
              title="Align Center"
            >
              ↔
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
              title="Align Right"
            >
              ➡
            </button>
          </div>

          {/* Actions */}
          <div className="toolbar-group">
            <button
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              className={editor.isActive('link') ? 'is-active' : ''}
              title="Add Link"
            >
              🔗 Link
            </button>
            <button
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              title="Clear Formatting"
            >
              🧹 Clear
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="resume-editor-content" />
    </div>
  );
};

export default ResumeEditor;
