"use client";
import "@/shared/styles/tiptap.css";
import React, {
  ReactElement,
  useCallback,
  memo,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import TextAlign from "@tiptap/extension-text-align";
import {
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tooltip,
} from "@mui/material";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
interface LinkContext {
  defaultProtocol: string;
  protocols: (string | { scheme: string })[];
  defaultValidate: (url: string) => boolean;
}

//UTILS
import { cn } from "@/shared/utils/cn";
import { useDebounce } from "@/shared/utils/debounce";

//ICONS
const H1Icon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <text x="2" y="20" fontSize="20" fontWeight="bold">
      H1
    </text>
  </SvgIcon>
);

const H2Icon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <text x="2" y="20" fontSize="18" fontWeight="bold">
      H2
    </text>
  </SvgIcon>
);
import {
  FormatBold,
  FormatItalic,
  StrikethroughS,
  FormatClear,
  FormatListNumbered,
  FormatListBulleted,
  FormatQuote,
  Undo,
  Redo,
  HorizontalRule,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Link as LinkIcon,
  Code as CodeIcon,
  CodeOff as CodeOffIcon,
} from "@mui/icons-material";

interface EditorButton {
  type: "button";
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
  name?: string;
  className: string;
  icon: ReactElement;
  isActive: boolean;
}
interface MenuBarProps {
  editor: ReturnType<typeof useEditor> | null;
  className?: string;
}
const isActive = "!bg-accent-500/30";

// Memoize the MenuBar component to prevent unnecessary re-renders
const MenuBar = memo(({ editor, className }: MenuBarProps) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      console.log(e);
      // alert(e.message);
    }
  }, [editor]);

  // Memoize button arrays to prevent recreating objects on each render
  const editorStructureButtons: EditorButton[] = useMemo(
    () => [
      {
        type: "button",
        onClick: () => editor?.chain().focus().setTextAlign("left").run(),
        className: ` ${editor?.isActive({ textAlign: "left" }) ? isActive : ""}`,
        icon: <FormatAlignLeft />,
        isActive: editor?.isActive({ textAlign: "left" }) || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().setTextAlign("center").run(),
        className: ` ${editor?.isActive({ textAlign: "center" }) ? isActive : ""}`,
        icon: <FormatAlignCenter />,
        isActive: editor?.isActive({ textAlign: "center" }) || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().setTextAlign("right").run(),
        className: ` ${editor?.isActive({ textAlign: "right" }) ? isActive : ""}`,
        icon: <FormatAlignRight />,
        isActive: editor?.isActive({ textAlign: "right" }) || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().setTextAlign("justify").run(),
        className: ` ${editor?.isActive({ textAlign: "justify" }) ? isActive : ""}`,
        icon: <FormatAlignJustify />,
        isActive: editor?.isActive({ textAlign: "justify" }) || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
        className: ` ${editor?.isActive("bulletList") ? isActive : ""}`,
        icon: <FormatListBulleted />,
        isActive: editor?.isActive("bulletList") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        className: ` ${editor?.isActive("orderedList") ? isActive : ""}`,
        icon: <FormatListNumbered />,
        isActive: editor?.isActive("orderedList") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleBlockquote().run(),
        className: ` ${editor?.isActive("blockquote") ? isActive : ""}`,
        icon: <FormatQuote />,
        isActive: editor?.isActive("blockquote") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().setHorizontalRule().run(),
        className: "",
        icon: <HorizontalRule />,
        isActive: false,
      },
    ],
    [editor]
  );

  const editorRedoButtons: EditorButton[] = useMemo(
    () => [
      {
        type: "button",
        onClick: () => editor?.chain().focus().undo().run(),
        disabled: !editor?.can().chain().focus().undo().run(),
        className: ` ${!editor?.can().chain().focus().undo().run() ? "opacity-50" : ""}`,
        icon: <Undo />,
        isActive: false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().redo().run(),
        disabled: !editor?.can().chain().focus().redo().run(),
        className: ` ${!editor?.can().chain().focus().redo().run() ? "opacity-50" : ""}`,
        icon: <Redo />,
        isActive: false,
      },
    ],
    [editor]
  );

  const editorButtons: EditorButton[] = useMemo(
    () => [
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleBold().run(),
        disabled: !editor?.can().chain().focus().toggleBold().run(),
        className: ` ${editor?.isActive("bold") ? isActive : ""}`,
        icon: <FormatBold />,
        isActive: editor?.isActive("bold") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        disabled: !editor?.can().chain().focus().toggleItalic().run(),
        className: ` ${editor?.isActive("italic") ? isActive : ""}`,
        icon: <FormatItalic />,
        isActive: editor?.isActive("italic") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().toggleStrike().run(),
        disabled: !editor?.can().chain().focus().toggleStrike().run(),
        className: ` ${editor?.isActive("strike") ? isActive : ""}`,
        icon: <StrikethroughS />,
        isActive: editor?.isActive("strike") || false,
      },
      {
        type: "button",
        onClick: () => editor?.chain().focus().unsetAllMarks().run(),
        className: "",
        icon: <FormatClear />,
        isActive: false,
        tooltip: "Clear formatting",
      },
      {
        type: "button",
        onClick: () =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        className: ` ${editor?.isActive("heading", { level: 1 }) ? isActive : ""}`,
        icon: <H1Icon />,
        isActive: editor?.isActive("heading", { level: 1 }) || false,
      },
      {
        type: "button",
        onClick: () =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        className: ` ${editor?.isActive("heading", { level: 2 }) ? isActive : ""}`,
        icon: <H2Icon />,
        isActive: editor?.isActive("heading", { level: 2 }) || false,
      },
      {
        type: "button",
        onClick: setLink,
        className: ` ${editor?.isActive("link") ? isActive : ""}`,
        icon: <LinkIcon />,
        isActive: editor?.isActive("link") || false,
      },
      {
        name: "codeBlock",
        type: "button",
        onClick: () => editor?.chain().focus().toggleCodeBlock().run(),
        className: ` ${editor?.isActive("codeBlock") ? isActive : ""}`,
        icon: editor?.isActive("codeBlock") ? <CodeOffIcon /> : <CodeIcon />,
        isActive: editor?.isActive("codeBlock") || false,
      },
    ],
    [editor, setLink]
  );

  if (!editor) {
    return null;
  }

  return (
    <ToggleButtonGroup
      className={cn(
        "flex flex-wrap  border border-primary-600/30  p-2 bg-primary-950 !rounded-b-none shadow-md",
        className
      )}
    >
      {editorButtons.map((button, index) => (
        <Tooltip title={button?.tooltip} key={index} placement="top">
          <ToggleButton
            color="primary"
            value={button.icon}
            key={index}
            type={button.type}
            onClick={button.onClick}
            disabled={button.disabled ? button.disabled : false}
            className={cn(
              "!p-2 !m-0.5 !border-0 !rounded-md ",
              button.className
            )}
            sx={{
              px: 1,
            }}
          >
            {button.icon}
          </ToggleButton>
        </Tooltip>
      ))}
      <Divider flexItem orientation="vertical" className="!mx-1" />

      {editorStructureButtons.map((button, index) => (
        <ToggleButton
          color="primary"
          value={button.icon}
          key={index}
          type={button.type}
          onClick={button.onClick}
          disabled={button.disabled ? button.disabled : false}
          className={cn("!p-2 !m-0.5 !border-0 !rounded-md ", button.className)}
          sx={{
            px: 1,
          }}
        >
          {button.icon}
        </ToggleButton>
      ))}
      <Divider flexItem orientation="vertical" className="!mx-1" />

      {editorRedoButtons.map((button, index) => (
        <ToggleButton
          color="primary"
          value={button.icon}
          key={index}
          type={button.type}
          onClick={button.onClick}
          disabled={button.disabled ? button.disabled : false}
          className={cn("!p-2 !m-0.5 !border-0 !rounded-md ", button.className)}
          sx={{
            px: 1,
          }}
        >
          {button.icon}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
});

MenuBar.displayName = "MenuBar";

// Memoize extensions configuration to prevent recreating on each render
const createExtensions = () => [
  StarterKit.configure({
    // Disable unnecessary history functionality since the editor manages it
    history: {
      depth: 10, // Reduce history depth to save memory
    },
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: "list-disc pl-4",
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: "list-decimal pl-4",
    },
  }),
  Blockquote.configure({}),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    protocols: ["http", "https"],
    HTMLAttributes: {
      spellcheck: "false",
      contenteditable: "false",
    },
    isAllowedUri: (url: string, ctx: LinkContext) => {
      try {
        const parsedUrl = url.includes(":")
          ? new URL(url)
          : new URL(`${ctx.defaultProtocol}://${url}`);

        if (!ctx.defaultValidate(parsedUrl.href)) {
          return false;
        }

        const disallowedProtocols: string[] = ["ftp", "file", "mailto"];
        const protocol: string = parsedUrl.protocol.replace(":", "");
        if (disallowedProtocols.includes(protocol)) {
          return false;
        }

        const allowedProtocols: string[] = ctx.protocols.map((p) =>
          typeof p === "string" ? p : p.scheme
        );
        if (!allowedProtocols.includes(protocol)) {
          return false;
        }
        //  // Replace with your own logic to determine if the URL is allowed
        const disallowedDomains: string[] = [
          "example-phishing.com",
          "malicious-site.net",
        ];
        if (disallowedDomains.includes(parsedUrl.hostname)) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    shouldAutoLink: (url: string) => {
      try {
        const parsedUrl = url.includes(":")
          ? new URL(url)
          : new URL(`https://${url}`);
        //  Replace with your own logic to determine if autolink should be applied
        // For example, you can check against a list of disallowed domains
        const disallowedDomains: string[] = [
          "example-no-autolink.com",
          "another-no-autolink.com",
        ];
        return !disallowedDomains.includes(parsedUrl.hostname);
      } catch {
        return false;
      }
    },
  }),
];

// Create a memoized extensions instance
const extensions = createExtensions();

interface RichTextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  editorClassName?: string;
  errors?: string;
  hasMenuBar?: boolean;
}


function RichTextInput({
  value,
  onChange,
  hasMenuBar = true,
  editorClassName,
}: RichTextInputProps) {
  // Keep track of internal HTML content for debouncing
  const [editorContent, setEditorContent] = React.useState(value || "");
  const lastContentRef = useRef(value || "");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the debounced value for onChange to reduce the number of parent component updates
  const debouncedContent = useDebounce(editorContent, 300);

  // Call parent onChange when debounced content changes
  useEffect(() => {
    if (debouncedContent !== lastContentRef.current && onChange) {
      onChange(debouncedContent);
      lastContentRef.current = debouncedContent;
    }
  }, [debouncedContent, onChange]);

  const editor = useEditor({
    extensions,
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "outline-none focus:outline-none p-4 border-b-2 border-b-white focus:border-b-accent-600 !transition-all  duration-300  bg-primary-800 shadow-md   !outilne-0 ring-0",
          editorClassName
        ),
      },
    },
    onUpdate: ({ editor }) => {
      // Update internal state immediately but debounce the parent callback
      const newContent = editor.getHTML();
      setEditorContent(newContent);

      // Clear pending timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    },
  });

  // Update editor content if value prop changes from outside
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      {hasMenuBar && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

// Memoize the whole component
export default memo(RichTextInput);
