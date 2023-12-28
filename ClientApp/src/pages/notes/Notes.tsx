import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OutputData } from '@editorjs/editorjs';
import { ItemInfoSubHeader } from '../../components/itemInfoHeader/ItemInfoHeader';
import styles from './notes.module.scss';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Note } from '../../entities/notes/note';
import { NOTE_EMPTY_TITLE_PLACEHOLDER } from '../../constants/notesConstants';
import Title from 'antd/es/typography/Title';
import { RichTextEditor } from '../../components/richTextEditor/RichTextEditor';
import * as RoutingConstants from '../../constants/routingConstants';
import { observer } from 'mobx-react-lite';
import { theme } from 'antd';
import SideMenuIndexStore from '../../store/sideMenu/sideMenuIndexStore';
import useBreadcrumbs from '../../hooks/useBreadcrumbs';
import useNotesAPI from '../../hooks/api/useNotesApi';
import { Loader } from '../../components/loader/Loader';

export const NotesComponent = observer((): JSX.Element => {
  const { notesStore, commonSideMenuStore, sideMenuItems } = SideMenuIndexStore;

  const { id } = useParams();
  const location = useLocation();

  const [isFetching, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const breadCrumbsItems = useBreadcrumbs(location.pathname, sideMenuItems);

  const [note, setNote] = useState<Note | undefined>(undefined);
  const [isEditorLoading, setIsEditorLoading] = useState<boolean>(true);
  const noteRef = useRef(note);
  const notesApi = useNotesAPI();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onEditorContentChange = async (data: OutputData): Promise<void> => {
    if (!noteRef.current) return;

    setLoading(true);
    const updateNoteResponse = await notesApi.updateContent(noteRef.current.id, {
      content: JSON.stringify(data),
    });

    setNote(updateNoteResponse.data);

    setLoading(false);
  };

  const onTitleUpdate = async (changedTitle: string): Promise<void> => {
    if (!id) return;

    const newTitle = changedTitle.length !== 0 ? changedTitle : NOTE_EMPTY_TITLE_PLACEHOLDER;

    if (note?.title === newTitle) return;

    setLoading(true);
    const { data } = await notesApi.updateTitle(id, { newTitle: newTitle });
    setNote(data);
    notesStore.renameNoteInSideMenu(data.id, data.title);
    setLoading(false);
  };

  const onItemDelete = async (): Promise<void> => {
    if (!id) return;

    const deletedNoteIdResponse = await notesApi.delete(id);
    notesStore.removeNoteFromSideMenu(deletedNoteIdResponse.data);
    commonSideMenuStore.changeSelectedMenuKey([RoutingConstants.NOTE_LIST_ROUTE]);
    navigate(`/${RoutingConstants.NOTE_LIST_ROUTE}`);
  };

  const loadNote = async (): Promise<void> => {
    if (!id) return;

    const noteResponse = await notesApi.getById(id);
    setNote(noteResponse.data);
    noteRef.current = noteResponse.data;
  };

  useEffect(() => {
    loadNote().then(() => {
      setIsEditorLoading(false);
    });

    return () => {
      setIsEditorLoading(true);
    };
  }, [id]);

  return (
    <div
      style={{
        background: colorBgContainer,
      }}
    >
      {isEditorLoading ? (
        <div className={styles.editorLoader}>
          <Loader />
        </div>
      ) : (
        <ItemInfoSubHeader
          onDeleteCallback={onItemDelete}
          breadCrumbsItems={breadCrumbsItems}
          editedAt={note?.updatedDate}
          createdAt={note?.createdDate ?? new Date()}
          isLoading={isFetching}
        />
      )}
      <div
        style={{
          visibility: isEditorLoading ? 'hidden' : 'visible',
        }}
        className={styles.pageContent}
      >
        <div className={styles.noteTitleContainer}>
          <Title
            editable={{
              triggerType: ['text'],
              text: note?.title,
              onChange: (changedTitle: string) => onTitleUpdate(changedTitle),
            }}
            level={2}
            className={styles.noteTitle}
            inputMode={'text'}
          >
            {note?.title}
          </Title>
        </div>
        {useMemo(
          () => note && <RichTextEditor data={JSON.parse(note.richTextContent)} onChange={onEditorContentChange} />,
          [note?.id]
        )}
      </div>
    </div>
  );
});
