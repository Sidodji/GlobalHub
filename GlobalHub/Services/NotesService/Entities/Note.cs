﻿namespace NotesService.Entities;

/// <summary>
/// Entity that represents user's note in Markdown format
/// </summary>
public class Note
{
    /// <summary>
    /// Entity Id
    /// </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>
    /// Date and time when the note was created
    /// </summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>
    /// Date and time when the note was created
    /// </summary>
    public DateTime? UpdatedDate { get; set; } = null;

    /// <summary>
    /// Used Id of user that created the note
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Note's title
    /// </summary>
    public string Title { get; set; } = NotesConstants.DefaultNoteTitle;

    /// <summary>
    /// Note's content in Markdown format
    /// </summary>
    public string RichTextContent { get; set; } = NotesConstants.DefaultNoteContentValue;
}
