var notePresenter = (function () {

        init = function () {

            var notes = [];
            noteModel.init();
            notes = noteModel.getNotes();
            lenght = notes.length;
            while (lenght--) {
                printNote(notes.shift());
            }
        },

        printNote = function (note) {
            noteView.createNoteElem(note);
        };

    init();

    return {
        debug: function () {
            console.log(noteModel.debug());
        },
        create: function () {
            id = noteModel.genID();
            // creating a new note
            var note = new Note(id, "Click Tittle", "Click content", new Date(), id);
            noteModel.save(note);
            printNote(note);
        },
        edit: function (data) {
            return noteModel.edit(data);
        },
        delete: function (id, note) {
            noteModel.delete(id);
            noteView.removeNote(note);
        },
        redo: function () { },
        undo: function () { }
    }
})();
