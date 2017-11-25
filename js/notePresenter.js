var notePresenter = (function () {

    var init = function () {
        var notes = [];
        noteModel.init();
        notes = noteModel.getNotes();
        lenght = notes.length;
        while (lenght--) {
            printNote(notes.shift());
        }
    },

        printNote = function (note) {
            noteView.addNote(note);
        },

        execute = function ( name ) {
            return notePresenter[name] && notePresenter[name].apply(notePresenter, [].slice.call(arguments, 1) );
        };

    init();

    return {
        debug: function () {
            console.log(noteModel.debug());
        },
        create: function () {
            id = noteModel.genID();
            // creating a new note
            var note = new Note(id, "Click Tittle", "Click Message", new Date(), id);
            noteModel.create(note);
            printNote(note);
        },
        orderingByDom: function (notes, data) {
            notes.sort(function (note1, note2) {
                return note1.style.order - note2.style.order;
            });
            var noteTargetIndex = notes.findIndex(function (note) {
                return note.guid == data.guid;
            }),
                noteReferenceIndex = notes.findIndex(function (note) {
                    return note.guid == data.noteReferenceGuid;
                }),
                notesChanged = [], // array of data info
                data = {};

            notes[noteTargetIndex].style.order = notes[noteReferenceIndex].style.order;
            data = { id: notes[noteTargetIndex].guid, order: notes[noteTargetIndex].style.order };
            notesChanged.push(data);
            if (noteReferenceIndex < noteTargetIndex) {
                for (var index = noteReferenceIndex; index < noteTargetIndex; index++) {
                    notes[index].style.order++;
                    data = { id: notes[index].guid, order: notes[index].style.order };
                    notesChanged.push(data);
                    if (notes[index].style.order != notes[index + 1].style.order) {
                        break;
                    }
                }
            }
            else {
                for (var index = noteReferenceIndex; index > noteTargetIndex; index--) {
                    notes[index].style.order--;
                    data = { id: notes[index].guid, order: notes[index].style.order };
                    notesChanged.push(data);
                    if (notes[index].style.order != notes[index - 1].style.order) {
                        break;
                    }
                }
            }
            noteModel.ordering(notesChanged);
        },
        ordering: function(notes) {

        },
        edit: function (data) {
            return noteModel.edit(data);
        },
        delete: function (id, note) {
            noteModel.delete(id);
            noteView.removeNote(note);
        },
        redo: function () {

        },
        undo: function () {
            var change = {}
            change = noteModel.undo();
        }
    }
})();
