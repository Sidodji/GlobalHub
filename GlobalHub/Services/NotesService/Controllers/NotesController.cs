namespace NotesService.Controllers;

/// <summary>
/// Controller that manages user's notes
/// </summary>
[ApiController]
[Route("api/v1/[controller]/[action]")]
public class NotesController : ControllerBase
{
    private readonly INotesRepository _notesRepository;
    private readonly IUserService _userService;

    public NotesController(INotesRepository notesRepository, IUserService userService)
    {
        _notesRepository = notesRepository;
        _userService = userService;
    }

    /// <summary>
    /// Gets all available for current user notes
    /// </summary>
    /// <returns>Dto that contains Id and Title for each menu item that available for current user</returns>
    [HttpGet]
    public ActionResult<IEnumerable<NoteMenuItem>> GetNoteMap()
    {
        var userId = _userService.UserId;
        var notes = _notesRepository.GetNotesMap(userId);
        var noteMap = notes.Select(note => new NoteMenuItem { Id = note.Id, Title = note.Title });

        return Ok(noteMap);
    }

    /// <summary>
    /// Gets all notes
    /// </summary>
    /// <returns>Set that contains all notes from database</returns>
    [HttpGet]
    public ActionResult<Note> GetNoteById(string id)
    {
        var isNoteIdValid = IsNoteIdValid(id);

        if (!isNoteIdValid)
        {
            return BadRequest();
        }

        var note = _notesRepository.GetById(id);
        AuthorizeAccessToTheNote(note);

        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    /// <summary>
    /// Gets list of available notes
    /// </summary>
    /// <returns>Notes, available for current user</returns>
    [HttpGet]
    public ActionResult<IEnumerable<Note>> GetNoteList()
    {
        var userId = _userService.UserId;
        var notes = _notesRepository.GetNoteList(userId);

        return Ok(notes);
    }

    /// <summary>
    /// Creates new note
    /// </summary>
    /// <param name="createNoteDto">Dto that contains data for the new note</param>
    [HttpPost]
    public ActionResult<Note> CreateNote(CreateNoteDto createNoteDto)
    {
        var newNote = new Note
        {
            CreatedDate = DateTime.Now, Title = createNoteDto.Title, CreatedBy = _userService.UserId
        };
        var createdNote = _notesRepository.Create(newNote);

        return StatusCode(StatusCodes.Status201Created, createdNote);
    }

    /// <summary>
    /// Updates note's content
    /// </summary>
    /// <param name="id">Note's id</param>
    /// <param name="updateDto">Updated note's content</param>
    /// <returns>Updated note</returns>
    [HttpPut]
    public ActionResult<Note> UpdateNoteContent(string id, [FromBody] UpdateNoteContentDto updateDto)
    {
        var note = _notesRepository.GetById(id);
        AuthorizeAccessToTheNote(note);
        note.RichTextContent = updateDto.Content;
        note.UpdatedDate = DateTime.Now;
        var updatedNote = _notesRepository.Update(note);

        return Ok(updatedNote);
    }

    /// <summary>
    /// Updates note's content
    /// </summary>
    /// <param name="id">Note's id</param>
    /// <param name="updateNoteTitleDto">Updated note's title</param>
    /// <returns>Updated note</returns>
    [HttpPut]
    public ActionResult<Note> UpdateNoteTitle(string id, [FromBody] UpdateNoteTitleDto updateNoteTitleDto)
    {
        var note = _notesRepository.GetById(id);
        AuthorizeAccessToTheNote(note);
        note.Title = updateNoteTitleDto.NewTitle;
        note.UpdatedDate = DateTime.Now;
        var updatedNote = _notesRepository.Update(note);

        return Ok(updatedNote);
    }

    /// <summary>
    /// Deletes note with specified id
    /// </summary>
    /// <param name="id">Note's id</param>
    [HttpDelete]
    public ActionResult<string> DeleteNote(string id)
    {
        var note = _notesRepository.GetById(id);
        AuthorizeAccessToTheNote(note);

        _notesRepository.DeleteById(id);

        return Ok(id);
    }

    private void AuthorizeAccessToTheNote(Note? note)
    {
        if (note == null || note.CreatedBy != _userService.UserId)
        {
            throw new AccessDeniedException("Access denied");
        }
    }

    private bool IsNoteIdValid(string noteId) => ObjectId.TryParse(noteId, out var _);
}
