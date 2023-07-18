import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API } from '@editorjs/editorjs';
import { debounce } from 'lodash';
import { ItemInfoSubHeader } from '../../components/itemInfoHeader/ItemInfoHeader';
import styles from './notes.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { deleteNote, getNoteById, updateNoteContent, updateNoteTitle } from '../../api/noteService';
import { Note } from '../../models/notes/note';
import {
  EDITOR_ON_CHANGE_DEBOUNCE,
  NOTE_DEFAULT_CONTENT,
  NOTE_TITLE_PLACEHOLDER,
} from '../../constants/notesConstants';
import Title from 'antd/es/typography/Title';
import { RichTextEditor } from '../../components/richTextEditor/RichTextEditor';
import SideMenuStore from '../../store/sideMenuStore';
import { getItemTitleWithOptionsButton } from '../../helpers/sideMenuHelper';
import * as RoutingConstants from '../../constants/routingConstants';
import { observer } from 'mobx-react-lite';
import { getBreadCrumbsItemsByLocation } from '../../helpers/breadCrumbsHelper';
import { BreadCrumbItem } from '../../models/breadCrumbs/breadCrumbItem';

export const NotesComponent = observer((): JSX.Element => {
  const { id } = useParams();
  const location = useLocation();

  const [isLoading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [breadCrumbsItems, setBreadCrumbsItems] = useState<BreadCrumbItem[]>([]);

  const [note, setNote] = useState<Note | undefined>(undefined);
  const noteRef = useRef(note);
  const { renameNoteInSideMenu, removeNoteFromSideMenu, changeSelectedMenuKey, getSideMenuItemByRoutingKey } =
    SideMenuStore;

  const onEditorContentChange = async (api: API): Promise<void> => {
    const data = await api.saver.save();
    if (noteRef.current === undefined) return;
    setLoading(true);
    const updateNoteResponse = await updateNoteContent(noteRef.current.id, {
      content: JSON.stringify(data),
    });
    setNote(updateNoteResponse.data);
    setLoading(false);
  };

  const onNoteTitleUpdate = async (changedTitle: string): Promise<void> => {
    if (note === undefined) return;

    const newTitle = changedTitle.length !== 0 ? changedTitle : NOTE_TITLE_PLACEHOLDER;

    setNote({
      ...note,
      title: newTitle,
    });

    setLoading(true);
    const { data } = await updateNoteTitle(note.id, {
      newTitle: newTitle,
    });

    setNote(data);
    renameNoteInSideMenu(data.id, getItemTitleWithOptionsButton(data.title));
    setLoading(false);
  };

  const debouncedOnChange = debounce(onEditorContentChange, EDITOR_ON_CHANGE_DEBOUNCE);

  const onItemDelete = async (): Promise<void> => {
    if (note?.id === undefined) return;

    const deletedNoteIdResponse = await deleteNote(note.id);
    removeNoteFromSideMenu(deletedNoteIdResponse.data);
    changeSelectedMenuKey([RoutingConstants.NOTE_LIST_ROUTE]);
    navigate(`/${RoutingConstants.NOTE_LIST_ROUTE}`);
  };

  const loadNote = async (): Promise<void> => {
    if (id === undefined) return;

    const noteResponse = await getNoteById(id);
    setNote(noteResponse.data);
    noteRef.current = noteResponse.data;
  };

  useEffect((): void => {
    loadNote();
  }, [id]);

  useEffect(() => {
    if (!note || !location) return;

    const items = getBreadCrumbsItemsByLocation(location.pathname, getSideMenuItemByRoutingKey);

    setBreadCrumbsItems(items);
  }, [location, note]);

  return (
    <>
      <ItemInfoSubHeader
        onDeleteCallback={onItemDelete}
        breadCrumbsItems={breadCrumbsItems}
        itemTitle={note?.title}
        lastEdited={note?.updatedDate ?? note?.createdDate}
        isLoading={isLoading}
      />
      <div className={styles.pageContent}>
        <div className={styles.noteTitleContainer}>
          <Title
            editable={{
              triggerType: ['text'],
              text: note?.title,
              onChange: (changedTitle: string) => onNoteTitleUpdate(changedTitle),
            }}
            level={2}
            className={styles.noteTitle}
            inputMode={'text'}
          >
            {note?.title}
          </Title>
        </div>
        {useMemo(
          () => (
            <RichTextEditor
              data={JSON.parse(note?.richTextContent ?? NOTE_DEFAULT_CONTENT)}
              onChange={debouncedOnChange}
            />
          ),
          [note?.id]
        )}
      </div>
    </>
  );
});