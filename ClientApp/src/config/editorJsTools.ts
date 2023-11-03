// eslint-disable-next-line
// @ts-nocheck
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Warning from '@editorjs/warning';
import NestedList from '@editorjs/nested-list';
import LinkTool from '@editorjs/link';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import CheckList from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import InlineCode from 'codex.editor.inline-code';
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
import ColorPlugin from 'editorjs-text-color-plugin';
import Alert from 'editorjs-alert';
import Paragraph from '@editorjs/paragraph';
import Code from '@rxpm/editor-js-code';
import ToggleBlock from 'editorjs-toggle-block';
import EditorJsColumns from '@calumk/editorjs-columns';
import EditorJS from '@editorjs/editorjs';

const paragraph = {
  class: Paragraph,
  inlineToolbar: true,
  config: {
    placeholder: 'Input your text',
  },
  preserveBlank: true,
};

const embed = Embed;

const table = {
  class: Table,
  inlineToolbar: true,
};

const nestedList = {
  class: NestedList,
  inlineToolbar: true,
  config: {
    defaultStyle: 'unordered',
  },
};

const warning = Warning;

const likTool = LinkTool;

const header = {
  class: Header,
  inlineToolbar: true,
  config: {
    placeholder: 'Input your header',
  },
};

const quote = {
  class: Quote,
  inlineToolbar: true,
  config: {
    quotePlaceholder: 'Enter a quote',
    captionPlaceholder: 'Quote author',
  },
};

const marker = Marker;

const checkList = {
  class: CheckList,
  inlineToolbar: true,
  tunes: ['anyTuneAlignment'],
};

const delimiter = Delimiter;

const inlineCode = InlineCode;

const alignmentTuneTool = AlignmentTuneTool;

const color = {
  class: ColorPlugin,
  config: {
    colorCollections: [
      '#EC7878',
      '#9C27B0',
      '#673AB7',
      '#3F51B5',
      '#0070FF',
      '#03A9F4',
      '#00BCD4',
      '#4CAF50',
      '#8BC34A',
      '#CDDC39',
      '#FFF',
    ],
    defaultColor: '#FF1300',
    type: 'text',
    customPicker: true,
  },
};

const anyTuneAlignment = {
  class: AlignmentTuneTool,
  config: {
    default: 'left',
    blocks: {
      header: 'center',
      list: 'right',
    },
  },
};

const code = {
  class: Code,
  config: {
    modes: {
      text: 'Plain text',
      js: 'JavaScript',
      py: 'Python',
      go: 'Go',
      cpp: 'C++',
      cs: 'C#',
      md: 'Markdown',
    },
    defaultMode: 'text',
  },
};

const alert = {
  class: Alert,
  inlineToolbar: true,
};

const toggleBlock = {
  class: ToggleBlock,
};

const columnTools = {
  paragraph,
  embed,
  table,
  nestedList,
  warning,
  likTool,
  header,
  quote,
  marker,
  checkList,
  delimiter,
  inlineCode,
  alignmentTuneTool,
  color,
  anyTuneAlignment,
  code,
  alert,
  toggleBlock,
};

const columns = {
  class: EditorJsColumns,
  config: {
    EditorJsLibrary: EditorJS,
    tools: columnTools,
  },
};

export const editorTools = {
  paragraph,
  embed,
  table,
  nestedList,
  warning,
  likTool,
  header,
  quote,
  marker,
  checkList,
  delimiter,
  inlineCode,
  alignmentTuneTool,
  color,
  anyTuneAlignment,
  code,
  alert,
  toggleBlock,
  columns,
};
